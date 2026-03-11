import { PoolConnection, RowDataPacket } from "mysql2/promise";
import { SyncPushRecord } from "../schemas/sync";
import { toMySQLDateTime } from "../helpers/date";

export const syncRecordsService = {
  async created(
    conn: PoolConnection,
    records: SyncPushRecord[],
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
          toMySQLDateTime(record.date_time),
          record.description,
        ],
      );
    }
  },

  async updated(
    conn: PoolConnection,
    records: SyncPushRecord[],
    companyId: string,
    userId: string,
  ) {
    for (const record of records) {
      const [rows] = await conn.query<RowDataPacket[]>(
        `SELECT usuario_id FROM registro WHERE id = ? AND empresa_id = ?`,
        [record.id, companyId],
      );

      if (rows.length === 0) {
        throw new Error(`record_not_found:${record.id}`);
      }

      if (rows[0].usuario_id !== userId) {
        throw new Error(`unauthorized_record_access:${record.id}`);
      }

      await conn.query(
        `UPDATE registro
         SET tipo = ?, data_hora = ?, descricao = ?, updated_at = NOW()
         WHERE id = ? AND empresa_id = ? AND usuario_id = ?`,
        [
          record.type,
          toMySQLDateTime(record.date_time),
          record.description,
          record.id,
          companyId,
          userId,
        ],
      );
    }
  },

  async deleted(
    conn: PoolConnection,
    ids: string[],
    companyId: string,
    userId: string,
  ) {
    for (const id of ids) {
      const [rows] = await conn.query<RowDataPacket[]>(
        `SELECT usuario_id FROM registro WHERE id = ? AND empresa_id = ?`,
        [id, companyId],
      );

      if (rows.length === 0) {
        throw new Error(`record_not_found:${id}`);
      }

      if (rows[0].usuario_id !== userId) {
        throw new Error(`unauthorized_record_access:${id}`);
      }

      await conn.query(
        `DELETE FROM registro WHERE id = ? AND empresa_id = ? AND usuario_id = ?`,
        [id, companyId, userId],
      );
    }
  },
};
