CREATE TABLE `hydration_friend_days` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`friend_key` text NOT NULL,
	`name` text NOT NULL,
	`date` text NOT NULL,
	`total_ml` integer NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `hydration_friend_day_unique` ON `hydration_friend_days` (`user_id`,`friend_key`,`date`);--> statement-breakpoint
CREATE INDEX `hydration_friend_user_date` ON `hydration_friend_days` (`user_id`,`date`);