CREATE TABLE `hydration_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`request_id` text NOT NULL,
	`amount_ml` integer NOT NULL,
	`occurred_at` text NOT NULL,
	`created_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hydration_request_unique` ON `hydration_entries` (`user_id`,`request_id`);--> statement-breakpoint
CREATE INDEX `hydration_user_time` ON `hydration_entries` (`user_id`,`occurred_at`);--> statement-breakpoint
CREATE TABLE `hydration_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`goal_ml` integer DEFAULT 2000 NOT NULL
);
