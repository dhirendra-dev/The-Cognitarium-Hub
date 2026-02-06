CREATE TABLE `boardExamQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(100) NOT NULL,
	`chapter` varchar(255) NOT NULL,
	`questionType` enum('mcq','shortAnswer','longAnswer','numericalProblem') NOT NULL,
	`questionText` text NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`marks` int DEFAULT 1,
	`source` varchar(255),
	`aiGenerated` boolean DEFAULT false,
	`verified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `boardExamQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mcqOptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`optionText` text NOT NULL,
	`isCorrect` boolean DEFAULT false,
	`explanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mcqOptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`userAnswer` text,
	`isCorrect` boolean DEFAULT false,
	`marksObtained` int DEFAULT 0,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questionAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questionCollections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`subject` varchar(100) NOT NULL,
	`totalQuestions` int DEFAULT 0,
	`difficulty` enum('easy','medium','hard','mixed') DEFAULT 'mixed',
	`createdBy` int,
	`isPublic` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questionCollections_id` PRIMARY KEY(`id`)
);
