CREATE TABLE `compliance_documents` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`document_type` enum('police_check','wwcc','first_aid','pet_first_aid','animal_care_cert','public_liability_insurance','abn_registration','other') NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`file_size` int,
	`mime_type` varchar(100),
	`reference_number` varchar(255),
	`issue_date` varchar(10),
	`expiry_date` varchar(10),
	`notes` text,
	`verification_status` enum('pending','verified','rejected','expired') NOT NULL DEFAULT 'pending',
	`rejection_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `compliance_documents` ADD CONSTRAINT `compliance_documents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `comp_doc_user_idx` ON `compliance_documents` (`user_id`);--> statement-breakpoint
CREATE INDEX `comp_doc_type_idx` ON `compliance_documents` (`document_type`);--> statement-breakpoint
CREATE INDEX `comp_doc_user_type_idx` ON `compliance_documents` (`user_id`,`document_type`);--> statement-breakpoint
CREATE INDEX `comp_doc_status_idx` ON `compliance_documents` (`verification_status`);