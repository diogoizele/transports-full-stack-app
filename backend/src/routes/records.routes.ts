import { Request, Response, Router } from "express";
import { pool } from "../db/connection";

export const recordRoutes = Router();

recordRoutes.get("/", async (req: Request, res: Response) => {
  const companyId = req.user?.companyId;

  const [rows] = await pool.query(
    `
    SELECT
      r.id,
      r.tipo,
      r.data_hora,
      r.descricao,
      f.id AS foto_id,
      f.caminho
    FROM registro r
    LEFT JOIN foto_registro f
      ON f.registro_id = r.id
      AND f.deleted_at IS NULL
    WHERE r.empresa_id = ?
      AND r.deleted_at IS NULL
    ORDER BY r.data_hora DESC
    `,
    [companyId],
  );

  const map = new Map();

  for (const row of rows as any[]) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        type: row.tipo,
        dateTime: row.data_hora,
        description: row.descricao,
        images: [],
      });
    }

    if (row.foto_id) {
      map.get(row.id).images.push({
        id: row.foto_id,
        url: row.caminho,
      });
    }
  }

  return res.json(Array.from(map.values()));
});

recordRoutes.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const companyId = req.user?.companyId;

  const [rows] = await pool.query(
    `
    SELECT
      r.id,
      r.tipo,
      r.data_hora,
      r.descricao,
      r.empresa_id,
      r.usuario_id,
      r.created_at,
      r.updated_at,
      f.id AS foto_id,
      f.caminho
    FROM registro r
    LEFT JOIN foto_registro f
      ON f.registro_id = r.id
      AND f.deleted_at IS NULL
    WHERE r.id = ?
      AND r.empresa_id = ?
      AND r.deleted_at IS NULL
    `,
    [id, companyId],
  );

  const result = rows as any[];

  if (result.length === 0) {
    return res.status(404).json({ message: "Record not found" });
  }

  const base = result[0];

  const images = result
    .filter((r) => r.foto_id)
    .map((r) => ({
      id: r.foto_id,
      url: r.caminho,
    }));

  return res.json({
    id: base.id,
    type: base.tipo,
    dateTime: base.data_hora,
    description: base.descricao,
    companyId: base.empresa_id,
    userId: base.usuario_id,
    images,
    createdAt: base.created_at,
    updatedAt: base.updated_at,
  });
});

/**
 * Criação offline-first (id deve vir do client)
 */
recordRoutes.post("/", async (req: Request, res: Response) => {
  const { id, type, dateTime, description, images } = req.body;
  const companyId = req.user?.companyId;
  const userId = req.user?.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
      INSERT INTO registro
        (id, empresa_id, usuario_id, tipo, data_hora, descricao)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [id, companyId, userId, type, dateTime, description],
    );

    if (images?.length) {
      for (const img of images) {
        await connection.query(
          `
          INSERT INTO foto_registro
            (id, registro_id, caminho)
          VALUES (?, ?, ?)
          `,
          [img.id, id, img.url],
        );
      }
    }

    await connection.commit();

    return res.status(201).json({ id });
  } catch (e) {
    await connection.rollback();
    return res.status(500).json({ message: "Error creating record" });
  } finally {
    connection.release();
  }
});

/**
 * Atualização (last-write-wins via updated_at do servidor)
 */
recordRoutes.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type, dateTime, description } = req.body;

  if (
    !type ||
    !dateTime ||
    !description ||
    description.length < 10 ||
    !["COMPRA", "VENDA"].includes(type)
  ) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const companyId = req.user?.companyId;

  const [result]: any = await pool.query(
    `
    UPDATE registro
    SET tipo = ?,
        data_hora = ?,
        descricao = ?
    WHERE id = ?
      AND empresa_id = ?
      AND deleted_at IS NULL
    `,
    [type, dateTime, description, id, companyId],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Record not found" });
  }

  const [rows] = await pool.query(
    `
    SELECT updated_at
    FROM registro
    WHERE id = ?
    `,
    [id],
  );

  const updatedAt = (rows as any[])[0]?.updated_at;

  return res.json({
    id,
    type,
    dateTime,
    description,
    updatedAt,
  });
});

/**
 * Soft delete
 */
recordRoutes.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const companyId = req.user?.companyId;

  const [result]: any = await pool.query(
    `
    UPDATE registro
    SET deleted_at = NOW()
    WHERE id = ?
      AND empresa_id = ?
      AND deleted_at IS NULL
    `,
    [id, companyId],
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Record not found" });
  }

  return res.status(204).send();
});
