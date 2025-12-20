CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalHoursStudied` decimal(8,2) DEFAULT '0',
	`topicsCompleted` int DEFAULT 0,
	`chaptersCompleted` int DEFAULT 0,
	`samplePapersCompleted` int DEFAULT 0,
	`averageScore` decimal(5,2) DEFAULT '0',
	`streakDays` int DEFAULT 0,
	`rank` int,
	`points` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`),
	CONSTRAINT `leaderboard_userId_unique` UNIQUE(`userId`)
);
