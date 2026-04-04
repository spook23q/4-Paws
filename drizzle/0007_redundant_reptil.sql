CREATE TABLE `sitter_availability` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`sitter_id` bigint NOT NULL,
	`date` varchar(10) NOT NULL,
	`status` enum('available','unavailable') NOT NULL DEFAULT 'available',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sitter_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sitter_availability` ADD CONSTRAINT `sitter_availability_sitter_id_users_id_fk` FOREIGN KEY (`sitter_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `avail_sitter_idx` ON `sitter_availability` (`sitter_id`);--> statement-breakpoint
CREATE INDEX `avail_date_idx` ON `sitter_availability` (`date`);--> statement-breakpoint
CREATE INDEX `avail_sitter_date_idx` ON `sitter_availability` (`sitter_id`,`date`);