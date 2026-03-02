export interface Record {
  id: string;

  type: "COMPRA" | "VENDA";

  dateTime: string;

  description: string;

  companyId: string;
  userId: string;
}
