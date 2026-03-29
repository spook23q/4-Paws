CREATE TABLE `bookings` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`owner_id` bigint NOT NULL,
	`sitter_id` bigint NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`start_time` varchar(50) NOT NULL,
	`end_time` varchar(50) NOT NULL,
	`cat_ids` text NOT NULL,
	`special_instructions` text,
	`total_price` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cats` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`owner_id` bigint NOT NULL,
	`name` varchar(255) NOT NULL,
	`age` int NOT NULL,
	`photo` text,
	`temperament` text,
	`medical_notes` text,
	`feeding_schedule` text,
	`is_indoor` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`owner_id` bigint NOT NULL,
	`sitter_id` bigint NOT NULL,
	`booking_id` bigint,
	`last_message_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`conversation_id` bigint NOT NULL,
	`sender_id` bigint NOT NULL,
	`content` text NOT NULL,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `owner_profiles` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`suburb` varchar(255) NOT NULL,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `owner_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`booking_id` bigint NOT NULL,
	`sitter_id` bigint NOT NULL,
	`owner_id` bigint NOT NULL,
	`rating` int NOT NULL,
	`review_text` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sitter_profiles` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`suburb` varchar(255) NOT NULL,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`service_area_radius` int NOT NULL DEFAULT 10,
	`price_per_day` decimal(10,2) NOT NULL,
	`price_per_night` decimal(10,2) NOT NULL,
	`years_experience` int NOT NULL DEFAULT 0,
	`bio` text,
	`accepts_indoor` boolean NOT NULL DEFAULT true,
	`accepts_outdoor` boolean NOT NULL DEFAULT true,
	`accepts_kittens` boolean NOT NULL DEFAULT true,
	`accepts_seniors` boolean NOT NULL DEFAULT true,
	`accepts_medical_needs` boolean NOT NULL DEFAULT false,
	`can_administer_medication` boolean NOT NULL DEFAULT false,
	`can_give_injections` boolean NOT NULL DEFAULT false,
	`experience_special_diets` boolean NOT NULL DEFAULT false,
	`can_handle_multiple_cats` boolean NOT NULL DEFAULT true,
	`average_rating` decimal(3,2) DEFAULT '0.00',
	`total_reviews` int NOT NULL DEFAULT 0,
	`total_bookings` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sitter_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('owner','sitter') NOT NULL,
	`name` varchar(255) NOT NULL,
	`profile_photo` text,
	`open_id` varchar(255),
	`login_method` varchar(50),
	`last_signed_in` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_sitter_id_users_id_fk` FOREIGN KEY (`sitter_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cats` ADD CONSTRAINT `cats_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_sitter_id_users_id_fk` FOREIGN KEY (`sitter_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_conversations_id_fk` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `owner_profiles` ADD CONSTRAINT `owner_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_sitter_id_users_id_fk` FOREIGN KEY (`sitter_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sitter_profiles` ADD CONSTRAINT `sitter_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `owner_idx` ON `bookings` (`owner_id`);--> statement-breakpoint
CREATE INDEX `sitter_idx` ON `bookings` (`sitter_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bookings` (`status`);--> statement-breakpoint
CREATE INDEX `start_date_idx` ON `bookings` (`start_date`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `cats` (`owner_id`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `conversations` (`owner_id`);--> statement-breakpoint
CREATE INDEX `sitter_idx` ON `conversations` (`sitter_id`);--> statement-breakpoint
CREATE INDEX `booking_idx` ON `conversations` (`booking_id`);--> statement-breakpoint
CREATE INDEX `conversation_idx` ON `messages` (`conversation_id`);--> statement-breakpoint
CREATE INDEX `sender_idx` ON `messages` (`sender_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `owner_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `booking_idx` ON `reviews` (`booking_id`);--> statement-breakpoint
CREATE INDEX `sitter_idx` ON `reviews` (`sitter_id`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `reviews` (`owner_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `sitter_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `suburb_idx` ON `sitter_profiles` (`suburb`);--> statement-breakpoint
CREATE INDEX `rating_idx` ON `sitter_profiles` (`average_rating`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `open_id_idx` ON `users` (`open_id`);