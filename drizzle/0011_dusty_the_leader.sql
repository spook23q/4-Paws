ALTER TABLE `bookings` ADD `booking_fee_payment_id` varchar(255);--> statement-breakpoint
ALTER TABLE `bookings` ADD `booking_fee_paid` boolean DEFAULT false NOT NULL;