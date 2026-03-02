import { Router, Request, Response } from "express";
import { pool } from "../db/connection";

export const syncRoutes = Router();

syncRoutes.get("/", async (req: Request, res: Response) => {
  const lastPulledAt = Number(req.query.lastPulledAt) || 0;
  const companyId = req.user?.companyId;

  const [createdOrUpdated] = await pool.query(
    `
    SELECT *
    FROM registro
    WHERE empresa_id = ?
      AND deleted_at IS NULL
      AND UNIX_TIMESTAMP(updated_at) * 1000 > ?
    `,
    [companyId, lastPulledAt],
  );

  const [deleted] = await pool.query(
    `
    SELECT id
    FROM registro
    WHERE empresa_id = ?
      AND deleted_at IS NOT NULL
      AND UNIX_TIMESTAMP(deleted_at) * 1000 > ?
    `,
    [companyId, lastPulledAt],
  );

  const records = createdOrUpdated as any[];

  const changes = {
    records: {
      created: [],
      updated: records.map((r) => ({
        id: r.id,
        companyId: r.empresa_id,
        userId: r.usuario_id,
        type: r.tipo,
        dateTime: r.data_hora,
        description: r.descricao,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      deleted: (deleted as any[]).map((d) => d.id),
    },
  };

  return res.json({
    changes,
    timestamp: Date.now(),
  });
});
