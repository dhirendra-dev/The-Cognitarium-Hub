CREATE TABLE `communityGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('telegram','whatsapp','discord','other') NOT NULL,
	`createdBy` int NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityGroups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groupLinks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`subject` varchar(100),
	`class` enum('11','12','jeeMain','jeeAdvanced') NOT NULL,
	`createdBy` int NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groupLinks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('announcement','important','update','event') DEFAULT 'announcement',
	`createdBy` int NOT NULL,
	`isActive` boolean DEFAULT true,
	`priority` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testSeries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`subject` varchar(100) NOT NULL,
	`class` enum('11','12','jeeMain','jeeAdvanced') NOT NULL,
	`totalQuestions` int NOT NULL,
	`duration` int NOT NULL,
	`createdBy` int NOT NULL,
	`isPublished` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `testSeries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testSeriesQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testSeriesId` int NOT NULL,
	`questionText` text NOT NULL,
	`optionA` text NOT NULL,
	`optionB` text NOT NULL,
	`optionC` text NOT NULL,
	`optionD` text NOT NULL,
	`correctOption` enum('A','B','C','D') NOT NULL,
	`explanation` text,
	`difficulty` enum('easy','medium','hard') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testSeriesQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userTestAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`testSeriesId` int NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`wrongAnswers` int NOT NULL,
	`skippedQuestions` int NOT NULL,
	`timeTaken` int,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userTestAttempts_id` PRIMARY KEY(`id`)
);
