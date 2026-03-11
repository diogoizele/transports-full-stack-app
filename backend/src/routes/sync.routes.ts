import { Router, Request, Response } from "express";
import { RowDataPacket } from "mysql2";

import { pool } from "../db/connection";
import { DBImagem, DBRegistro, DBUsuario } from "../db/interfaces";
import {
  SyncPullResponse,
  SyncPullResponseSchema,
  SyncPushRequestSchema,
} from "../schemas/sync";
import {
  mapImageDbToApi,
  mapRecordDbToApi,
  mapUserDbToApi,
} from "../mappers/sync.mapper";
import { prepareImageUrl } from "../helpers/image";
import { syncRecordsService } from "../services/sync-records.service";
import { syncImagesService } from "../services/sync-images.service";

interface RecordFromDb extends RowDataPacket, DBRegistro {
  created_at_ts: number;
  updated_at_ts: number;
}

interface ImageFromDb extends RowDataPacket, DBImagem {
  created_at_ts: number;
  updated_at_ts: number;
}

interface UserFromDb extends RowDataPacket, DBUsuario {
  created_at_ts: number;
  updated_at_ts: number;
}

export const syncRoutes = Router();

syncRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const lastPulledAt = Number(req.query.lastPulledAt) || 0;

    const companyId = req.user?.companyId;

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const [records] = await pool.query<Array<RecordFromDb>>(
      `SELECT
        r.*,
        u.id as id_usuario,
        UNIX_TIMESTAMP(r.created_at) * 1000 AS created_at_ts,
        UNIX_TIMESTAMP(r.updated_at) * 1000 AS updated_at_ts
      FROM
        registro r
      INNER JOIN
        usuario u on u.id = r.usuario_id
      WHERE 1=1 
        AND r.empresa_id = ?
        AND r.updated_at > FROM_UNIXTIME(? / 1000)`,
      [companyId, lastPulledAt],
    );

    const [images] = await pool.query<Array<ImageFromDb>>(
      `SELECT
        f.*,
        UNIX_TIMESTAMP(f.created_at) * 1000 AS created_at_ts,
        UNIX_TIMESTAMP(f.updated_at) * 1000 AS updated_at_ts
      FROM
        foto_registro f
      INNER JOIN
        registro r ON r.id = f.registro_id
      WHERE 1=1
        AND r.empresa_id = ?
        AND f.updated_at > FROM_UNIXTIME(? / 1000)`,
      [companyId, lastPulledAt],
    );

    const [users] = await pool.query<Array<UserFromDb>>(
      `SELECT
        u.*,
        UNIX_TIMESTAMP(u.created_at) * 1000 AS created_at_ts,
        UNIX_TIMESTAMP(u.updated_at) * 1000 AS updated_at_ts
      FROM
        usuario u
      WHERE 1=1
        AND u.empresa_id = ?
        AND u.updated_at > FROM_UNIXTIME(? / 1000)
      `,
      [companyId, lastPulledAt],
    );

    const urlImageResolver = (path: string) =>
      prepareImageUrl(baseUrl, "uploads", path);

    const response: SyncPullResponse = {
      changes: {
        records: {
          created: records
            .filter((r) => !r.deleted_at && r.created_at_ts > lastPulledAt)
            .map(mapRecordDbToApi),
          updated: records
            .filter((r) => !r.deleted_at && r.created_at_ts <= lastPulledAt)
            .map(mapRecordDbToApi),
          deleted: records.filter((r) => r.deleted_at).map((r) => r.id),
        },
        images: {
          created: images
            .filter((i) => !i.deleted_at && i.created_at_ts > lastPulledAt)
            .map(mapImageDbToApi)
            .map((image) => ({ ...image, path: urlImageResolver(image.path) })),
          updated: images
            .filter((i) => !i.deleted_at && i.created_at_ts <= lastPulledAt)
            .map(mapImageDbToApi)
            .map((image) => ({ ...image, path: urlImageResolver(image.path) })),
          deleted: images.filter((i) => i.deleted_at).map((i) => i.id),
        },
        users: {
          created: users
            .filter((u) => !u.deleted_at && u.created_at_ts > lastPulledAt)
            .map(mapUserDbToApi),
          updated: users
            .filter((u) => !u.deleted_at && u.created_at_ts <= lastPulledAt)
            .map(mapUserDbToApi),
          deleted: users.filter((u) => u.deleted_at).map((u) => u.id),
        },
      },
      timestamp: Date.now(),
    };

    SyncPullResponseSchema.parse(response);

    res.json(response);
  } catch (error) {
    console.error("[sync/pull]", error);
    res.status(500).json({ error: "sync_failed" });
  }
});

syncRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    const body = SyncPushRequestSchema.parse(req.body);
    const { records, images } = body.changes;

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      await syncRecordsService.created(
        conn,
        records.created,
        companyId!,
        userId!,
      );
      await syncRecordsService.updated(
        conn,
        records.updated,
        companyId!,
        userId!,
      );
      await syncRecordsService.deleted(
        conn,
        records.deleted,
        companyId!,
        userId!,
      );

      await syncImagesService.created(conn, images.created);
      await syncImagesService.updated(conn, images.updated);
      await syncImagesService.deleted(conn, images.deleted);

      await conn.commit();
      res.json({ status: "ok" });
    } catch (innerError) {
      await conn.rollback();
      throw innerError;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error("[sync/push]", error);

    if (error instanceof Error) {
      if (error.message.startsWith("record_not_found:")) {
        const recordId = error.message.split(":")[1];
        return res.status(404).json({
          error: "record_not_found",
          record_id: recordId,
        });
      }

      if (error.message.startsWith("unauthorized_record_access:")) {
        const recordId = error.message.split(":")[1];
        return res.status(403).json({
          error: "unauthorized_record_access",
          record_id: recordId,
        });
      }
    }

    res.status(500).json({ error: "sync_push_failed" });
  }
});
