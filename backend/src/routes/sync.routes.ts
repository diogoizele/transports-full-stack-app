import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { RowDataPacket } from "mysql2";

import { pool } from "../db/connection";
import { Image } from "../../../types/Image";

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
}

interface RecordSync {
  id: string;
  companyId: string;
  userId: string;
  type: "COMPRA" | "VENDA";
  dateTime: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  images: ImageResponse[];
}

export const syncRoutes = Router();

syncRoutes.get("/", async (req: Request, res: Response) => {
  const lastPulledAt = Number(req.query.lastPulledAt) || 0;
  const companyId = req.user?.companyId;

  const [rows] = await pool.query<RecordWithImages[]>(
    `
    SELECT
      r.*,
      f.id AS foto_id,
      f.caminho
    FROM registro r
    LEFT JOIN foto_registro f
      ON f.registro_id = r.id
      AND f.deleted_at IS NULL
    WHERE r.empresa_id = ?
      AND (r.deleted_at IS NULL OR UNIX_TIMESTAMP(r.deleted_at) * 1000 > ?)
      AND (
        UNIX_TIMESTAMP(r.created_at) * 1000 > ? 
        OR UNIX_TIMESTAMP(r.updated_at) * 1000 > ?
        OR r.deleted_at IS NOT NULL
      )
    ORDER BY r.data_hora DESC
    `,
    [companyId, lastPulledAt, lastPulledAt, lastPulledAt],
  );

  console.log({ rows });

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
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at || null,
        images: [],
      });
    }

    if (row.foto_id) {
      map.get(row.id)?.images.push({
        id: row.foto_id,
        path: row.caminho!,
      });
    }
  }

  const created: RecordSync[] = [];
  const updated: RecordSync[] = [];
  const deleted: string[] = [];

  for (const record of map.values()) {
    if (
      !record.deletedAt &&
      Number(new Date(record.createdAt)) > lastPulledAt
    ) {
      created.push(record);
    } else if (!record.deletedAt) {
      updated.push(record);
    } else if (
      record.deletedAt &&
      Number(new Date(record.deletedAt)) > lastPulledAt
    ) {
      deleted.push(record.id);
    }
  }

  return res.json({
    changes: {
      records: { created, updated, deleted },
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
  const { changes } = req.body;
  const recordChanges = changes.records;

  for (const r of recordChanges.created) {
    // Criar registro
    await pool.query(
      `INSERT INTO registro (id, empresa_id, usuario_id, tipo, data_hora, descricao, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [r.id, companyId, r.userId, r.type, r.dateTime, r.description],
    );

    // Inserir imagens
    if (r.images?.length) {
      for (const img of r.images as ImageResponse[]) {
        await pool.query(
          `INSERT INTO foto_registro (id, registro_id, caminho) VALUES (?, ?, ?)`,
          [img.id, r.id, img.path],
        );
      }
    }
  }

  for (const r of recordChanges.updated) {
    // Atualizar registro
    await pool.query(
      `UPDATE registro SET tipo=?, data_hora=?, descricao=?, updated_at=NOW() WHERE id=? AND empresa_id=?`,
      [r.type, r.dateTime, r.description, r.id, companyId],
    );

    if (r.images) {
      const [existingRows] = await pool.query(
        `SELECT * FROM foto_registro WHERE registro_id=?`,
        [r.id],
      );
      const existingIds = (existingRows as any[]).map((i) => i.id);
      const frontendIds = r.images.map((i: ImageResponse) => i.id);

      // Deletar imagens removidas
      const toDelete = existingIds.filter((id) => !frontendIds.includes(id));
      for (const id of toDelete) {
        const [imgRow] = await pool.query<RowDataPacket[]>(
          `SELECT caminho FROM foto_registro WHERE id=?`,
          [id],
        );

        const filePath = path.join(
          __dirname,
          "../uploads",
          path.basename(imgRow[0].caminho),
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await pool.query(`DELETE FROM foto_registro WHERE id=?`, [id]);
      }

      // Inserir novas imagens
      for (const img of (r.images as ImageResponse[]).filter(
        (i: ImageResponse) => !existingIds.includes(i.id),
      )) {
        await pool.query(
          `INSERT INTO foto_registro (id, registro_id, caminho) VALUES (?, ?, ?)`,
          [img.id, r.id, img.path],
        );
      }
    }
  }

  for (const id of recordChanges.deleted) {
    // Deletar registro → fotos serão deletadas automaticamente pelo ON DELETE CASCADE
    await pool.query(`DELETE FROM registro WHERE id=? AND empresa_id=?`, [
      id,
      companyId,
    ]);
  }

  return res.json({ status: "ok" });
});
