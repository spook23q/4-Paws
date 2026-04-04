CREATE TABLE `favourites` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`sitter_id` bigint NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favourites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `favourites` ADD CONSTRAINT `favourites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favourites` ADD CONSTRAINT `favourites_sitter_id_users_id_fk` FOREIGN KEY (`sitter_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `fav_user_idx` ON `favourites` (`user_id`);--> statement-breakpoint
CREATE INDEX `fav_sitter_idx` ON `favourites` (`sitter_id`);--> statement-breakpoint
CREATE INDEX `fav_unique_idx` ON `favourites` (`user_id`,`sitter_id`);