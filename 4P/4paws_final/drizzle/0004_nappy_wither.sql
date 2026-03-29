ALTER TABLE `users` ADD `street_address` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `suburb` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `state` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `postcode` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(100) DEFAULT 'Australia';--> statement-breakpoint
ALTER TABLE `users` ADD `latitude` decimal(10,7);--> statement-breakpoint
ALTER TABLE `users` ADD `longitude` decimal(10,7);