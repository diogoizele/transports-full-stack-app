import fs from "fs";
import path from "path";
import { PoolConnection, RowDataPacket } from "mysql2/promise";

import { SyncPushImage } from "../schemas/sync";
import { BUCKET_DIR, isBase64, saveBase64Image } from "../bucket";

export const syncImagesService = {
  async created(conn: PoolConnection, images: SyncPushImage[]) {
    for (const img of images) {
      const [imageRow] = await conn.query(
        `SELECT id FROM foto_registro WHERE id = ?`,
        [img.id],
      );
      const exists = Array.isArray(imageRow) && imageRow.length > 0;
      if (!isBase64(img.path) || exists) continue;

      const [parentRow] = await conn.query(
        `SELECT id FROM registro WHERE id = ?`,
        [img.record_id],
      );
      const parentExists = Array.isArray(parentRow) && parentRow.length > 0;
      if (!parentExists) continue;

      const relativePath = saveBase64Image(img.path);
      await conn.query(
        `INSERT INTO foto_registro (id, registro_id, caminho) VALUES (?, ?, ?)`,
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

      if (!isBase64(img.path)) continue;

      if (existing[0]?.caminho) {
        const oldPath = path.join(BUCKET_DIR, existing[0].caminho);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      const relativePath = saveBase64Image(img.path);
      await conn.query(`UPDATE foto_registro SET caminho = ? WHERE id = ?`, [
        relativePath,
        img.id,
      ]);
    }
  },

  async deleted(conn: PoolConnection, ids: string[]) {
    for (const id of ids) {
      const [existing] = await conn.query<RowDataPacket[]>(
        `SELECT caminho FROM foto_registro WHERE id = ?`,
        [id],
      );

      if (existing[0]?.caminho) {
        const filePath = path.join(BUCKET_DIR, existing[0].caminho);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await conn.query(`DELETE FROM foto_registro WHERE id = ?`, [id]);
    }
  },
};
