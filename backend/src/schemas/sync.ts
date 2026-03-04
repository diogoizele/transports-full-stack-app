import { z } from "zod";

export const SyncRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["COMPRA", "VENDA"]),
  date_time: z.string(),
  description: z.string(),

  created_at: z.number(),
  updated_at: z.number(),
});

export const SyncImageSchema = z.object({
  id: z.string(),
  record_id: z.string(),
  path: z.string(),

  created_at: z.number(),
  updated_at: z.number(),
});

// ===================== PULL AREA ===================== //

export const SyncPullResponseSchema = z.object({
  changes: z.object({
    records: z.object({
      created: z.array(SyncRecordSchema),
      updated: z.array(SyncRecordSchema),
      deleted: z.array(z.string()),
    }),
    images: z.object({
      created: z.array(SyncImageSchema),
      updated: z.array(SyncImageSchema),
      deleted: z.array(z.string()),
    }),
  }),
  timestamp: z.number(),
});

export type SyncRecord = z.infer<typeof SyncRecordSchema>;
export type SyncImage = z.infer<typeof SyncImageSchema>;
export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;

// ===================== PUSH AREA ===================== //

export const SyncPushRequestSchema = z.object({
  changes: z.object({
    records: z.object({
      created: z.array(SyncRecordSchema),
      updated: z.array(SyncRecordSchema),
      deleted: z.array(z.string()),
    }),
    images: z.object({
      created: z.array(SyncImageSchema),
      updated: z.array(SyncImageSchema),
      deleted: z.array(z.string()),
    }),
  }),
});

export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;
