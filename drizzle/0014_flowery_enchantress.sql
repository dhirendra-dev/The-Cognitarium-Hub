CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int,
	`quizId` int,
	`certificateType` enum('course','quiz') NOT NULL,
	`certificateId` varchar(100) NOT NULL,
	`certificateUrl` text,
	`certificateKey` varchar(500),
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateId_unique` UNIQUE(`certificateId`)
);
--> statement-breakpoint
CREATE TABLE `courseEnrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`progressPercentage` decimal(5,2) DEFAULT '0',
	CONSTRAINT `courseEnrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`thumbnail` text,
	`category` varchar(100),
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`isFree` boolean DEFAULT true,
	`price` decimal(10,2) DEFAULT '0',
	`createdBy` int NOT NULL,
	`isPublished` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessonProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`isCompleted` boolean DEFAULT false,
	`completedAt` timestamp,
	`watchedDuration` int DEFAULT 0,
	CONSTRAINT `lessonProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text,
	`content` text,
	`pdfUrl` text,
	`duration` int,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quizId` int NOT NULL,
	`score` decimal(5,2) NOT NULL,
	`percentage` decimal(5,2) NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`timeTaken` int,
	`passed` boolean NOT NULL,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizOptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`optionText` text NOT NULL,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizOptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizQuestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`questionText` text NOT NULL,
	`questionType` enum('mcq','truefalse','fillblank') DEFAULT 'mcq',
	`correctAnswer` text NOT NULL,
	`explanation` text,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`passPercentage` int DEFAULT 70,
	`timeLimit` int,
	`shuffleQuestions` boolean DEFAULT false,
	`shuffleOptions` boolean DEFAULT false,
	`createdBy` int NOT NULL,
	`isPublished` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
