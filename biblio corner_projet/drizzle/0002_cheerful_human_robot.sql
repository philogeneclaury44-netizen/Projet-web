CREATE TABLE `returns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanId` int NOT NULL,
	`returnedAt` timestamp NOT NULL DEFAULT (now()),
	`lateDays` int NOT NULL DEFAULT 0,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `returns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `loans` MODIFY COLUMN `status` enum('requested','approved','borrowed','returned','overdue','rejected','cancelled') NOT NULL DEFAULT 'requested';--> statement-breakpoint
ALTER TABLE `members` MODIFY COLUMN `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','librarian','member') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `authors` ADD `birthDate` varchar(20);--> statement-breakpoint
ALTER TABLE `authors` ADD `photoUrl` text;--> statement-breakpoint
ALTER TABLE `books` ADD `publisher` varchar(180);--> statement-breakpoint
ALTER TABLE `books` ADD `shelf` varchar(80);--> statement-breakpoint
ALTER TABLE `books` ADD `status` enum('active','archived') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `loans` ADD `librarianId` int;--> statement-breakpoint
ALTER TABLE `loans` ADD `borrowedAt` timestamp;--> statement-breakpoint
ALTER TABLE `members` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `members` ADD `photoUrl` text;--> statement-breakpoint
ALTER TABLE `members` ADD `expirationDate` timestamp;