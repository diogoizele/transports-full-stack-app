import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { RowDataPacket } from "mysql2";

import { pool } from "../db/connection";
import { Image } from "../../../types/Image";
import { toTimestamp } from "../helpers/date";
import { BUCKET_DIR, isBase64, saveBase64Image } from "../bucket";

interface ImageResponse extends Pick<Image, "id" | "path"> {}

interface RecordWithImages extends RowDataPacket {
  id: string;
  empresa_id: string;
  usuario_id: string;
  tipo: "COMPRA" | "VENDA";
  data_hora: string;
  descricao: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  foto_id?: string | null;
  caminho?: string | null;
  foto_deleted_at?: string | null;
}

interface RecordSync {
  id: string;
  companyId: string;
  userId: string;
  type: "COMPRA" | "VENDA";
  dateTime: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
  images: (ImageResponse & { deletedAt: number | null })[];
}

export const syncRoutes = Router();

syncRoutes.get("/", async (req: Request, res: Response) => {
  const lastPulledAt = Number(req.query.lastPulledAt) || 0;
  const companyId = req.user?.companyId;
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const [rows] = await pool.query<RecordWithImages[]>(
    `
    SELECT
      r.*,
      f.id AS foto_id,
      f.caminho,
      f.deleted_at AS foto_deleted_at
    FROM registro r
    LEFT JOIN foto_registro f
      ON f.registro_id = r.id
      AND (
        f.deleted_at IS NULL
        OR UNIX_TIMESTAMP(f.deleted_at) * 1000 > ?
      )
    WHERE r.empresa_id = ?
      AND (r.deleted_at IS NULL OR UNIX_TIMESTAMP(r.deleted_at) * 1000 > ?)
      AND (
        UNIX_TIMESTAMP(r.created_at) * 1000 > ?
        OR UNIX_TIMESTAMP(r.updated_at) * 1000 > ?
        OR r.deleted_at IS NOT NULL
      )
    ORDER BY r.data_hora DESC
    `,
    [lastPulledAt, companyId, lastPulledAt, lastPulledAt, lastPulledAt],
  );

  const map = new Map<string, RecordSync>();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        companyId: row.empresa_id,
        userId: row.usuario_id,
        type: row.tipo,
        dateTime: row.data_hora,
        description: row.descricao,
        createdAt: toTimestamp(row.created_at),
        updatedAt: toTimestamp(row.updated_at),
        deletedAt: row.deleted_at ? toTimestamp(row.deleted_at) : null,
        images: [],
      });
    }

    if (row.foto_id) {
      map.get(row.id)?.images.push({
        id: row.foto_id,
        path: row.caminho!,
        deletedAt: row.foto_deleted_at
          ? toTimestamp(row.foto_deleted_at)
          : null,
      });
    }
  }

  const createdRecords: object[] = [];
  const updatedRecords: object[] = [];
  const deletedRecords: string[] = [];
  const createdImages: object[] = [];
  const deletedImages: string[] = [];

  for (const record of map.values()) {
    const { images, ...rest } = record;

    const mapped = {
      id: rest.id,
      company_id: rest.companyId,
      user_id: rest.userId,
      type: rest.type,
      date_time: rest.dateTime,
      description: rest.description,
      created_at: rest.createdAt,
      updated_at: rest.updatedAt,
      deleted_at: rest.deletedAt ?? null,
    };

    if (!record.deletedAt && record.createdAt > lastPulledAt) {
      createdRecords.push(mapped);
    } else if (!record.deletedAt) {
      updatedRecords.push(mapped);
    } else if (record.deletedAt && record.deletedAt > lastPulledAt) {
      deletedRecords.push(record.id);
    }

    for (const img of images) {
      if (img.deletedAt) {
        deletedImages.push(img.id);
      } else {
        createdImages.push({
          id: img.id,
          record_id: record.id,
          path: `${baseUrl}/uploads/${img.path}`,
        });
      }
    }
  }

  return res.json({
    changes: {
      records: {
        created: createdRecords,
        updated: updatedRecords,
        deleted: deletedRecords,
      },
      images: {
        created: createdImages,
        updated: [],
        deleted: deletedImages,
      },
    },
    timestamp: Date.now(),
  });
});

/**
 * POST /sync
 * Recebe as mudanças feitas no frontend (local) e aplica no backend.
 * Espera: body = { changes: { records: { created: [], updated: [], deleted: [] } }, lastPulledAt }
 */
syncRoutes.post("/", async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;
  const userId = req.user?.id;
  const { changes } = req.body;
  const recordChanges = changes.records;
  const imageChanges = changes.images;

  // ==================== RECORDS  ==================== //

  for (const record of recordChanges.created) {
    const [recordRow] = await pool.query(`SELECT id FROM registro WHERE id=?`, [
      record.id,
    ]);

    const exists = Array.isArray(recordRow) && recordRow.length > 0;

    if (!exists) {
      await pool.query(
        `INSERT INTO registro (id, empresa_id, usuario_id, tipo, data_hora, descricao, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          record.id,
          companyId,
          userId,
          record.type,
          record.date_time,
          record.description,
        ],
      );
    }
  }

  for (const record of recordChanges.updated) {
    await pool.query(
      `UPDATE registro SET tipo=?, data_hora=?, descricao=?, updated_at=NOW() WHERE id=? AND empresa_id=?`,
      [record.type, record.date_time, record.description, record.id, companyId],
    );
  }

  for (const id of recordChanges.deleted) {
    await pool.query(`DELETE FROM registro WHERE id=? AND empresa_id=?`, [
      id,
      companyId,
    ]);
  }

  // ==================== IMAGES ==================== //

  for (const img of imageChanges.created) {
    const [imageRow] = await pool.query(
      `SELECT id FROM foto_registro WHERE id=?`,
      [img.id],
    );
    const exists = Array.isArray(imageRow) && imageRow.length > 0;
    if (!isBase64(img.path) || exists) continue;

    const [parentRow] = await pool.query(`SELECT id FROM registro WHERE id=?`, [
      img.record_id,
    ]);
    const parentExists = Array.isArray(parentRow) && parentRow.length > 0;
    if (!parentExists) continue;

    const relativePath = saveBase64Image(img.path);
    await pool.query(
      `INSERT INTO foto_registro (id, registro_id, caminho) VALUES (?, ?, ?)`,
      [img.id, img.record_id, relativePath],
    );
  }

  for (const img of imageChanges.updated) {
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT caminho FROM foto_registro WHERE id=?`,
      [img.id],
    );

    if (isBase64(img.path)) {
      if (existing[0]?.caminho) {
        const oldPath = path.join(BUCKET_DIR, existing[0].caminho);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const relativePath = saveBase64Image(img.path);

      await pool.query(`UPDATE foto_registro SET caminho=? WHERE id=?`, [
        relativePath,
        img.id,
      ]);
    }
  }

  for (const id of imageChanges.deleted) {
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT caminho FROM foto_registro WHERE id=?`,
      [id],
    );

    if (existing[0]?.caminho) {
      const filePath = path.join(BUCKET_DIR, existing[0].caminho);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query(`DELETE FROM foto_registro WHERE id=?`, [id]);
  }

  return res.json({ status: "ok" });
});
