import { z } from "zod";

// ===================== PULL SCHEMAS ===================== //

export const SyncRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["COMPRA", "VENDA"]),
  date_time: z.string(),
  description: z.string(),
  user_id: z.string(),
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

export const SyncUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  full_name: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
});

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
    users: z.object({
      created: z.array(SyncUserSchema),
      updated: z.array(SyncUserSchema),
      deleted: z.array(z.string()),
    }),
  }),
  timestamp: z.number(),
});

export type SyncRecord = z.infer<typeof SyncRecordSchema>;
export type SyncImage = z.infer<typeof SyncImageSchema>;
export type SyncUser = z.infer<typeof SyncUserSchema>;
export type SyncPullResponse = z.infer<typeof SyncPullResponseSchema>;

// ===================== PUSH SCHEMAS ===================== //

export const SyncPushRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["COMPRA", "VENDA"]),
  date_time: z.string(),
  description: z.string(),
});

export const SyncPushImageSchema = z.object({
  id: z.string(),
  record_id: z.string(),
  path: z.string(),
});

export const SyncPushRequestSchema = z.object({
  changes: z.object({
    records: z.object({
      created: z.array(SyncPushRecordSchema),
      updated: z.array(SyncPushRecordSchema),
      deleted: z.array(z.string()),
    }),
    images: z.object({
      created: z.array(SyncPushImageSchema),
      updated: z.array(SyncPushImageSchema),
      deleted: z.array(z.string()),
    }),
  }),
});

export type SyncPushRecord = z.infer<typeof SyncPushRecordSchema>;
export type SyncPushImage = z.infer<typeof SyncPushImageSchema>;
export type SyncPushRequest = z.infer<typeof SyncPushRequestSchema>;
