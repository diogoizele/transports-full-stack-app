import { PoolConnection } from "mysql2/promise";
import { SyncRecord } from "../schemas/sync";

export const syncRecordsService = {
  async created(
    conn: PoolConnection,
    records: SyncRecord[],
    companyId: string,
    userId: string,
  ) {
    for (const record of records) {
      const [row] = await conn.query(`SELECT id FROM registro WHERE id = ?`, [
        record.id,
      ]);
      const exists = Array.isArray(row) && row.length > 0;
      if (exists) continue;

      await conn.query(
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
  },

  async updated(
    conn: PoolConnection,
    records: SyncRecord[],
    companyId: string,
  ) {
    for (const record of records) {
      await conn.query(
        `UPDATE registro
         SET tipo = ?, data_hora = ?, descricao = ?, updated_at = NOW()
         WHERE id = ? AND empresa_id = ?`,
        [
          record.type,
          record.date_time,
          record.description,
          record.id,
          companyId,
        ],
      );
    }
  },

  async deleted(conn: PoolConnection, ids: string[], companyId: string) {
    for (const id of ids) {
      await conn.query(`DELETE FROM registro WHERE id = ? AND empresa_id = ?`, [
        id,
        companyId,
      ]);
    }
  },
};
