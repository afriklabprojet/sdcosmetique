CREATE TABLE `categories` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`label` varchar(128) NOT NULL,
	`sub_label` varchar(255) NOT NULL DEFAULT '',
	`image` text NOT NULL,
	`href` varchar(255) NOT NULL DEFAULT '',
	`icon` varchar(64) NOT NULL DEFAULT '',
	`is_quiz` boolean DEFAULT false,
	`order_index` int DEFAULT 0,
	`active` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `jeko_config` (
	`key` varchar(128) NOT NULL,
	`value` json NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jeko_config_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `jeko_transactions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`points` int NOT NULL,
	`reason` varchar(64) NOT NULL,
	`label` varchar(255),
	`reference_id` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `jeko_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`source` varchar(64) DEFAULT 'footer',
	`unsubscribed` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`product_id` varchar(64) NOT NULL,
	`product_slug` varchar(255),
	`name` varchar(255) NOT NULL,
	`price` int NOT NULL,
	`quantity` int NOT NULL,
	`image_url` text,
	`shade` varchar(64),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`order_number` varchar(64) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'confirmed',
	`subtotal` int NOT NULL,
	`shipping_cost` int NOT NULL DEFAULT 0,
	`total` int NOT NULL,
	`payment_method` varchar(64),
	`payment_status` varchar(32) NOT NULL DEFAULT 'pending',
	`payment_reference` varchar(128),
	`payment_provider` varchar(64),
	`payment_provider_txn_id` varchar(128),
	`payment_request_id` varchar(128),
	`payment_paid_at` timestamp,
	`delivery_first_name` varchar(128),
	`delivery_last_name` varchar(128),
	`delivery_email` varchar(255),
	`delivery_phone` varchar(64),
	`delivery_address` text,
	`delivery_city` varchar(128),
	`delivery_country` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL,
	`price` int NOT NULL,
	`original_price` int,
	`images` json DEFAULT ('[]'),
	`skin_tones` json DEFAULT ('[]'),
	`badges` json DEFAULT ('[]'),
	`rating` decimal(3,1) DEFAULT '0.0',
	`review_count` int DEFAULT 0,
	`short_description` text,
	`description` text,
	`benefits` json DEFAULT ('[]'),
	`usage` text,
	`ingredients` text,
	`in_stock` boolean DEFAULT true,
	`stock_qty` int,
	`low_stock_threshold` int DEFAULT 5,
	`results_title` text,
	`results_subtitle` text,
	`is_new` boolean DEFAULT false,
	`is_bestseller` boolean DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `quiz_concerns` (
	`id` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`meta` varchar(255) NOT NULL DEFAULT '',
	`glyph` varchar(16) NOT NULL DEFAULT '◯',
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_concerns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_routines` (
	`id` varchar(64) NOT NULL,
	`label` varchar(255) NOT NULL,
	`meta` varchar(255) NOT NULL DEFAULT '',
	`glyph` varchar(16) NOT NULL DEFAULT '◇',
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_routines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_submissions` (
	`id` varchar(36) NOT NULL,
	`skin_tone` varchar(64),
	`concern` varchar(128),
	`routine` varchar(128),
	`user_email` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(36) NOT NULL,
	`product_id` varchar(64),
	`author` varchar(128) NOT NULL,
	`city` varchar(128) DEFAULT '',
	`product` varchar(255) DEFAULT '',
	`product_slug` varchar(255) DEFAULT '',
	`rating` int NOT NULL,
	`title` varchar(255) DEFAULT '',
	`text` text NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`skin_tone` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_config` (
	`key` varchar(128) NOT NULL,
	`value` json NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_config_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` varchar(36) NOT NULL,
	`name` varchar(128) NOT NULL,
	`text` text NOT NULL,
	`avatar_url` text DEFAULT (''),
	`approved` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255),
	`role` varchar(32) NOT NULL DEFAULT 'customer',
	`prenom` varchar(128),
	`nom` varchar(128),
	`telephone` varchar(64),
	`avatar_url` text,
	`newsletter` boolean NOT NULL DEFAULT true,
	`points` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `jeko_transactions` ADD CONSTRAINT `jeko_transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;