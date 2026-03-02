import { Router, Request, Response } from "express";
import { pool } from "../db/connection";

export const syncRoutes = Router();

/**
 * GET /sync
 * Retorna as mudanças no backend desde o lastPulledAt.
 * Estrutura esperada pelo WatermelonDB:
 * changes = {
 *   records: { created: [], updated: [], deleted: [] }
 * }
 */
syncRoutes.get("/", async (req: Request, res: Response) => {
  const lastPulledAt = Number(req.query.lastPulledAt) || 0;
  const companyId = req.user?.companyId;

  // Registros criados depois de lastPulledAt
  const [createdRows] = await pool.query(
    `
    SELECT *
    FROM registro
    WHERE empresa_id = ?
      AND deleted_at IS NULL
      AND UNIX_TIMESTAMP(created_at) * 1000 > ?
    `,
    [companyId, lastPulledAt],
  );

  // Registros atualizados depois de lastPulledAt (exceto os que acabaram de ser criados)
  const [updatedRows] = await pool.query(
    `
    SELECT *
    FROM registro
    WHERE empresa_id = ?
      AND deleted_at IS NULL
      AND UNIX_TIMESTAMP(updated_at) * 1000 > ?
      AND UNIX_TIMESTAMP(created_at) * 1000 <= ?
    `,
    [companyId, lastPulledAt, lastPulledAt],
  );

  // Registros deletados depois de lastPulledAt
  const [deletedRows] = await pool.query(
    `
    SELECT id
    FROM registro
    WHERE empresa_id = ?
      AND deleted_at IS NOT NULL
      AND UNIX_TIMESTAMP(deleted_at) * 1000 > ?
    `,
    [companyId, lastPulledAt],
  );

  const changes = {
    records: {
      created: (createdRows as any[]).map((r) => ({
        id: r.id,
        companyId: r.empresa_id,
        userId: r.usuario_id,
        type: r.tipo,
        dateTime: r.data_hora,
        description: r.descricao,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      updated: (updatedRows as any[]).map((r) => ({
        id: r.id,
        companyId: r.empresa_id,
        userId: r.usuario_id,
        type: r.tipo,
        dateTime: r.data_hora,
        description: r.descricao,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      deleted: (deletedRows as any[]).map((d) => d.id),
    },
  };

  return res.json({
    changes,
    timestamp: Date.now(), // WatermelonDB usa esse timestamp para o próximo pull
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

  // Criados
  for (const r of recordChanges.created) {
    await pool.query(
      `INSERT INTO registro (id, empresa_id, usuario_id, tipo, data_hora, descricao, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        r.id, // passar o UUID/local id do frontend
        companyId,
        r.userId,
        r.type,
        r.dateTime,
        r.description,
      ],
    );
  }

  // Atualizados
  for (const r of recordChanges.updated) {
    await pool.query(
      `UPDATE registro
       SET tipo=?, data_hora=?, descricao=?, updated_at=NOW()
       WHERE id=? AND empresa_id=?`,
      [r.type, r.dateTime, r.description, r.id, companyId],
    );
  }

  // Deletados
  for (const id of recordChanges.deleted) {
    await pool.query(
      `UPDATE registro SET deleted_at=NOW() WHERE id=? AND empresa_id=?`,
      [id, companyId],
    );
  }

  return res.json({ status: "ok" });
});
