-- Biblio Corner — Base de données MySQL pour WAMP/phpMyAdmin
-- Compatible MySQL 8.x / MariaDB récente
-- Import : phpMyAdmin > Importer > sélectionner ce fichier

CREATE DATABASE IF NOT EXISTS `biblio_corner`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `biblio_corner`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `contactMessages`;
DROP TABLE IF EXISTS `returns`;
DROP TABLE IF EXISTS `loans`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `authors`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin','librarian','member') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `slug` varchar(140) NOT NULL,
  `description` text,
  `color` varchar(24) NOT NULL DEFAULT '#8d4b5b',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `authors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `bio` text,
  `nationality` varchar(100),
  `birthDate` varchar(20),
  `photoUrl` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(220) NOT NULL,
  `slug` varchar(240) NOT NULL,
  `isbn` varchar(32),
  `publisher` varchar(180),
  `publishedYear` int,
  `pages` int,
  `summary` text,
  `coverColor` varchar(24) NOT NULL DEFAULT '#8d4b5b',
  `coverUrl` text,
  `totalCopies` int NOT NULL DEFAULT 1,
  `availableCopies` int NOT NULL DEFAULT 1,
  `shelf` varchar(80),
  `status` enum('active','archived') NOT NULL DEFAULT 'active',
  `featured` int NOT NULL DEFAULT 0,
  `categoryId` int,
  `authorId` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `books_slug_unique` (`slug`),
  KEY `books_category_idx` (`categoryId`),
  KEY `books_author_idx` (`authorId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(40),
  `address` text,
  `photoUrl` text,
  `expirationDate` timestamp NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `members_email_unique` (`email`),
  KEY `members_user_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookId` int NOT NULL,
  `memberId` int,
  `librarianId` int,
  `requesterName` varchar(180) NOT NULL,
  `requesterEmail` varchar(320) NOT NULL,
  `requesterPhone` varchar(40),
  `message` text,
  `status` enum('requested','approved','borrowed','returned','overdue','rejected','cancelled') NOT NULL DEFAULT 'requested',
  `requestedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `borrowedAt` timestamp NULL,
  `dueDate` timestamp NULL,
  `returnedAt` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `loans_book_idx` (`bookId`),
  KEY `loans_member_idx` (`memberId`),
  KEY `loans_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `returns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loanId` int NOT NULL,
  `returnedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lateDays` int NOT NULL DEFAULT 0,
  `note` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `returns_loan_idx` (`loanId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contactMessages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(160) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(40),
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','archived') NOT NULL DEFAULT 'new',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `contact_status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int,
  `type` varchar(40) NOT NULL,
  `title` varchar(180) NOT NULL,
  `message` text NOT NULL,
  `readAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_user_idx` (`userId`),
  KEY `notifications_read_idx` (`readAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Données de test facultatives : décommentez pour vérifier l’installation.
-- INSERT INTO categories (name, slug, description, color)
-- VALUES ('Romans', 'romans', 'Des récits qui restent longtemps', '#8d4b5b');
-- INSERT INTO authors (name, nationality)
-- VALUES ('Auteur de démonstration', 'Haïtienne');
-- INSERT INTO books (title, slug, summary, categoryId, authorId, totalCopies, availableCopies)
-- VALUES ('Livre de démonstration', 'livre-de-demonstration', 'Un ouvrage de test.', 1, 1, 1, 1);
