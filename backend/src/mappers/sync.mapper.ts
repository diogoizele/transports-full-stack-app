import { DBImagem, DBRegistro, DBUsuario } from "../db/interfaces";
import { SyncImage, SyncRecord, SyncUser } from "../schemas/sync";

import { dateResolver, toMySQLDateTime } from "../helpers/date";

export const mapRecordDbToApi = (row: DBRegistro): SyncRecord => ({
  id: row.id,
  type: row.tipo,
  description: row.descricao,
  user_id: row.id_usuario,
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

export const mapUserDbToApi = (row: DBUsuario): SyncUser => ({
  id: row.id,
  username: row.login,
  full_name: row.nome,

  created_at: dateResolver(row.created_at)!,
  updated_at: dateResolver(row.updated_at)!,
});
