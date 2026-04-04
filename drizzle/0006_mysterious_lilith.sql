CREATE TABLE `notifications` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`type` enum('booking_request','booking_confirmed','booking_declined','booking_completed','booking_cancelled','new_message','new_review','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`data` text,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `notif_user_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notif_user_read_idx` ON `notifications` (`user_id`,`is_read`);--> statement-breakpoint
CREATE INDEX `notif_created_at_idx` ON `notifications` (`created_at`);