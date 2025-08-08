import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalName: text("original_name").notNull(),
  fileName: text("file_name").notNull(), // Telegram file name
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  shareCode: varchar("share_code", { length: 6 }).notNull().unique(),
  shareLink: text("share_link").notNull().unique(),
  telegramFileId: text("telegram_file_id").notNull(),
  telegramMessageId: integer("telegram_message_id").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

export const retrieveFileSchema = z.object({
  identifier: z.string().min(1, "Please enter a share code or link"),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type RetrieveFile = z.infer<typeof retrieveFileSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
