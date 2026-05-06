CREATE TABLE `homepageAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sectionName` varchar(100) NOT NULL,
	`interactionType` enum('view','click','expand','collapse') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `homepageAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incompleteStudySessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`materialId` int NOT NULL,
	`materialType` varchar(50) NOT NULL,
	`materialTitle` varchar(255) NOT NULL,
	`progressPercentage` int DEFAULT 0,
	`lastAccessedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `incompleteStudySessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `materialViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`materialId` int NOT NULL,
	`materialType` varchar(50) NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `materialViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userBoardPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`selectedBoard` enum('CBSE','HSLC','MP_BOARD','OTHER') DEFAULT 'CBSE',
	`selectedClass` enum('11','12') DEFAULT '12',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userBoardPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userBoardPreferences_userId_unique` UNIQUE(`userId`)
);
