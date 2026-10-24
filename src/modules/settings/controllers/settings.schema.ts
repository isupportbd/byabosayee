import { z } from "@/framework/facade.js";

export const SettingItemSchema = z.object({
  id: z.number().optional(),
  key: z.string(),
  value: z.string().nullable().optional(),
  group: z.string().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const SaveSettingSchema = z.object({
  key: z.string(),
  value: z.string().nullable().optional(),
  group: z.string().optional(),
  description: z.string().optional()
});
