CREATE TABLE `passeord_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` timestamp NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passeord_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `passeord_reset_tokens_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `passeord_reset_tokens` ADD CONSTRAINT `passeord_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;