CREATE TABLE `postReplies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`replyText` text NOT NULL,
	`likes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `postReplies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studyTimerSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`subject` varchar(100),
	`duration` int NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`isCompleted` boolean DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studyTimerSessions_id` PRIMARY KEY(`id`)
);
