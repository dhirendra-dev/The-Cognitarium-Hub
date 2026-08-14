CREATE TABLE `diagnosticPlacements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`level` enum('foundation','developing','examReady','advanced') NOT NULL,
	`questionCount` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `diagnosticPlacements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doubts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`topic` varchar(255),
	`questionText` text NOT NULL,
	`attachmentUrl` text,
	`voiceTranscript` text,
	`aiResponse` text,
	`confidence` decimal(5,2),
	`status` enum('open','aiResolved','needsMentor','assigned','resolved') NOT NULL DEFAULT 'open',
	`assignedTo` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doubts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionPerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicId` int,
	`topicType` enum('jeeSyllabus','boardSyllabus'),
	`attemptId` int,
	`questionRef` varchar(100),
	`timeSpentSeconds` int NOT NULL DEFAULT 0,
	`isCorrect` boolean NOT NULL,
	`errorType` enum('conceptual','calculation','silly','timePressure','none') NOT NULL DEFAULT 'none',
	`answerChanged` boolean NOT NULL DEFAULT false,
	`answeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionPerformance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rankSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`examType` enum('jeeMain','jeeAdvanced','neet') NOT NULL,
	`estimatedMin` int NOT NULL,
	`estimatedMax` int NOT NULL,
	`confidence` decimal(5,2) NOT NULL,
	`percentile` decimal(5,2),
	`snapshotDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rankSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `squadMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`squadId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','member') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `squadMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `squads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`inviteCode` varchar(32) NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `squads_id` PRIMARY KEY(`id`),
	CONSTRAINT `squads_inviteCode_unique` UNIQUE(`inviteCode`)
);
--> statement-breakpoint
CREATE TABLE `userTopicMastery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicId` int NOT NULL,
	`topicType` enum('jeeSyllabus','boardSyllabus') NOT NULL,
	`masteryScore` decimal(5,2) NOT NULL DEFAULT '0',
	`attempts` int NOT NULL DEFAULT 0,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`trend` enum('improving','stagnant','worsening') NOT NULL DEFAULT 'stagnant',
	`nextReviewAt` timestamp,
	`lastAttemptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userTopicMastery_id` PRIMARY KEY(`id`)
);
