import { DBImagem, DBRegistro } from "../db/interfaces";
import { SyncImage, SyncRecord } from "../schemas/sync";

import { dateResolver, toMySQLDateTime } from "../helpers/date";

export const mapRecordDbToApi = (row: DBRegistro): SyncRecord => ({
  id: row.id,
  type: row.tipo,
  description: row.descricao,
  date_time: toMySQLDateTime(row.data_hora),
  created_at: dateResolver(row.created_at)!,
  updated_at: dateResolver(row.updated_at)!,
});

export const mapImageDbToApi = (row: DBImagem): SyncImage => ({
  id: row.id,
  record_id: row.registro_id,
  path: row.caminho,

  created_at: dateResolver(row.created_at)!,
  updated_at: dateResolver(row.updated_at)!,
});
