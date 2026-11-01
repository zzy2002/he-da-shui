import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
export const settings = sqliteTable("hydration_settings", {
  userId: text("user_id").primaryKey(), goalMl: integer("goal_ml").notNull().default(2000),
});
export const entries = sqliteTable("hydration_entries", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(),
  requestId: text("request_id").notNull(), amountMl: integer("amount_ml").notNull(),
  occurredAt: text("occurred_at").notNull(), createdAt: text("created_at").notNull(),
  deletedAt: text("deleted_at"),
}, t => [uniqueIndex("hydration_request_unique").on(t.userId,t.requestId),
  index("hydration_user_time").on(t.userId,t.occurredAt)]);

export const friendDays = sqliteTable("hydration_friend_days", {
 id: text("id").primaryKey(), userId: text("user_id").notNull(),
 friendKey: text("friend_key").notNull(), name: text("name").notNull(),
 date: text("date").notNull(), totalMl: integer("total_ml").notNull(),
 updatedAt: text("updated_at").notNull(), deletedAt: text("deleted_at"),
}, t => [uniqueIndex("hydration_friend_day_unique").on(t.userId,t.friendKey,t.date),
 index("hydration_friend_user_date").on(t.userId,t.date)]);
