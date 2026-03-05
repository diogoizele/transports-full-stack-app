import { Router, Request, Response } from "express";
import { RowDataPacket } from "mysql2";

import { pool } from "../db/connection";
import { DBImagem, DBRegistro } from "../db/interfaces";
import {
  SyncPullResponse,
  SyncPullResponseSchema,
  SyncPushRequestSchema,
} from "../schemas/sync";
import { mapImageDbToApi, mapRecordDbToApi } from "../mappers/sync.mapper";
import { prepareImageUrl } from "../helpers/image";
import { syncRecordsService } from "../services/sync-records.service";
import { syncImagesService } from "../services/sync-images.service";

interface RecordFromDb extends RowDataPacket, DBRegistro {}

interface ImageFromDb extends RowDataPacket, DBImagem {}

export const syncRoutes = Router();

syncRoutes.get("/", async (req: Request, res: Response) => {
  try {
    const lastPulledAt = Number(req.query.lastPulledAt) || 0;

    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const [records] = await pool.query<
      Array<RecordFromDb & { updated_at: number; created_at: number }>
    >(
      `SELECT
        *,
        UNIX_TIMESTAMP(created_at) * 1000 AS created_at_ts,
        UNIX_TIMESTAMP(updated_at) * 1000 AS updated_at_ts
      FROM
        registro
      WHERE 1=1 
        AND empresa_id = ?
        AND usuario_id = ? 
        AND updated_at > FROM_UNIXTIME(? / 1000)`,
      [companyId, userId, lastPulledAt],
    );

    const [images] = await pool.query<
      Array<ImageFromDb & { updated_at: number; created_at: number }>
    >(
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
        AND r.usuario_id = ?
        AND f.updated_at > FROM_UNIXTIME(? / 1000)`,
      [companyId, userId, lastPulledAt],
    );

    const urlImageResolver = (path: string) =>
      prepareImageUrl(baseUrl, "uploads", path);

    const response: SyncPullResponse = {
      changes: {
        records: {
          created: records
            .filter((r) => !r.deleted_at && r.created_at > lastPulledAt)
            .map(mapRecordDbToApi),
          updated: records
            .filter((r) => !r.deleted_at && r.created_at <= lastPulledAt)
            .map(mapRecordDbToApi),
          deleted: records.filter((r) => r.deleted_at).map((r) => r.id),
        },
        images: {
          created: images
            .filter((i) => !i.deleted_at && i.created_at > lastPulledAt)
            .map(mapImageDbToApi)
            .map((image) => ({ ...image, path: urlImageResolver(image.path) })),
          updated: images
            .filter((i) => !i.deleted_at && i.created_at <= lastPulledAt)
            .map(mapImageDbToApi)
            .map((image) => ({ ...image, path: urlImageResolver(image.path) })),
          deleted: images.filter((i) => i.deleted_at).map((i) => i.id),
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
      await syncRecordsService.updated(conn, records.updated, companyId!);
      await syncRecordsService.deleted(conn, records.deleted, companyId!);

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
    res.status(500).json({ error: "sync_push_failed" });
  }
});
