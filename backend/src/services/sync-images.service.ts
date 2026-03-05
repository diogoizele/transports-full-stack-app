import fs from "fs";
import path from "path";
import { PoolConnection, RowDataPacket } from "mysql2/promise";

import { SyncPushImage } from "../schemas/sync";
import { BUCKET_DIR, isBase64, saveBase64Image } from "../bucket";

export const syncImagesService = {
  async created(conn: PoolConnection, images: SyncPushImage[]) {
    for (const img of images) {
      const [imageRow] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM foto_registro WHERE id = ?`,
        [img.id],
      );

      const exists = imageRow.length > 0;
      if (!isBase64(img.path) || exists) continue;

      const [parentRow] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM registro WHERE id = ?`,
        [img.record_id],
      );

      const parentExists = parentRow.length > 0;
      if (!parentExists) continue;

      const relativePath = saveBase64Image(img.path);

      await conn.query(
        `
        INSERT INTO foto_registro (
          id,
          registro_id,
          caminho,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, NOW(), NOW())
        `,
        [img.id, img.record_id, relativePath],
      );
    }
  },

  async updated(conn: PoolConnection, images: SyncPushImage[]) {
    for (const img of images) {
      const [existing] = await conn.query<RowDataPacket[]>(
        `SELECT caminho FROM foto_registro WHERE id = ?`,
        [img.id],
      );

      if (!existing.length) continue;
      if (!isBase64(img.path)) continue;

      const oldPath = existing[0].caminho
        ? path.join(BUCKET_DIR, existing[0].caminho)
        : null;

      if (oldPath && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }

      const relativePath = saveBase64Image(img.path);

      await conn.query(
        `
        UPDATE foto_registro
        SET caminho = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [relativePath, img.id],
      );
    }
  },

  async deleted(conn: PoolConnection, ids: string[]) {
    for (const id of ids) {
      const [existing] = await conn.query<RowDataPacket[]>(
        `SELECT caminho FROM foto_registro WHERE id = ?`,
        [id],
      );

      if (existing.length && existing[0].caminho) {
        const filePath = path.join(BUCKET_DIR, existing[0].caminho);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await conn.query(`DELETE FROM foto_registro WHERE id = ?`, [id]);
    }
  },
};
