export interface DBRegistro {
  id: string;
  tipo: "COMPRA" | "VENDA";
  data_hora: Date | string;
  descricao: string;

  updated_at: Date | string;
  created_at: Date | string;
  deleted_at: Date | string;
}

export interface DBImagem {
  id: string;
  registro_id: string;
  caminho: string;

  updated_at: Date | string;
  created_at: Date | string;
  deleted_at: Date | string;
}
