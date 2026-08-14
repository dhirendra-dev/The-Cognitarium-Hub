CREATE TABLE `formulaBookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`formulaSheetId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `formulaBookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formulaSheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(100) NOT NULL,
	`chapterId` int,
	`title` varchar(255) NOT NULL,
	`contentMarkdown` text NOT NULL,
	`keyFormulas` text,
	`shortcuts` text,
	`difficulty` enum('easy','medium','hard') DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `formulaSheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pyqArchive` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examYear` int NOT NULL,
	`examSession` varchar(100) NOT NULL,
	`subject` varchar(100) NOT NULL,
	`questionNumber` int NOT NULL,
	`questionText` text NOT NULL,
	`optionA` text NOT NULL,
	`optionB` text NOT NULL,
	`optionC` text NOT NULL,
	`optionD` text NOT NULL,
	`correctOption` enum('A','B','C','D') NOT NULL,
	`solutionMarkdown` text NOT NULL,
	`weightageTags` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pyqArchive_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `speedDrills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`mode` enum('lightning15','sprint30','marathon60') NOT NULL,
	`questionsAttempted` int NOT NULL,
	`correctCount` int NOT NULL,
	`timeTakenSeconds` int NOT NULL,
	`accuracyPercent` decimal(5,2) NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speedDrills_id` PRIMARY KEY(`id`)
);
