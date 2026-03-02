CREATE TABLE `boardSyllabusTopics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(100) NOT NULL,
	`class` enum('11','12') NOT NULL,
	`unit` varchar(255) NOT NULL,
	`chapter` varchar(255) NOT NULL,
	`topic` varchar(255) NOT NULL,
	`marks` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `boardSyllabusTopics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `examTimeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventName` varchar(255) NOT NULL,
	`eventType` enum('jeeMain','jeeAdvanced','boardClass11','boardClass12','milestone','revision') NOT NULL,
	`eventDate` timestamp NOT NULL,
	`description` text,
	`isImportant` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `examTimeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jeeSyllabusTopics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(100) NOT NULL,
	`unit` varchar(255) NOT NULL,
	`topic` varchar(255) NOT NULL,
	`subtopic` varchar(255),
	`class` enum('11','12') NOT NULL,
	`weightage` decimal(5,2),
	`difficulty` enum('easy','medium','hard') DEFAULT 'medium',
	`conceptsRequired` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jeeSyllabusTopics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mockTests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`testType` enum('jeeMain','jeeAdvanced','boardClass11','boardClass12') NOT NULL,
	`totalQuestions` int NOT NULL,
	`totalMarks` int NOT NULL,
	`duration` int NOT NULL,
	`difficulty` enum('easy','medium','hard') DEFAULT 'medium',
	`createdBy` int,
	`isPublic` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mockTests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `studyResources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`resourceType` enum('notes','video','article','formula','pyq','mock','book') NOT NULL,
	`subject` varchar(100) NOT NULL,
	`class` enum('11','12','jeeMain','jeeAdvanced') NOT NULL,
	`topic` varchar(255) NOT NULL,
	`url` text,
	`difficulty` enum('easy','medium','hard') DEFAULT 'medium',
	`createdBy` int,
	`isVerified` boolean DEFAULT false,
	`views` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studyResources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userMockTestAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mockTestId` int NOT NULL,
	`score` decimal(8,2) NOT NULL,
	`totalMarks` int NOT NULL,
	`percentage` decimal(5,2) NOT NULL,
	`questionsAttempted` int NOT NULL,
	`questionsCorrect` int NOT NULL,
	`questionsWrong` int NOT NULL,
	`questionsSkipped` int NOT NULL,
	`timeTaken` int,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userMockTestAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userTopicProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicId` int NOT NULL,
	`topicType` enum('jeeSyllabus','boardSyllabus') NOT NULL,
	`status` enum('notStarted','inProgress','completed','revised') DEFAULT 'notStarted',
	`completionPercentage` int DEFAULT 0,
	`questionsAttempted` int DEFAULT 0,
	`questionsCorrect` int DEFAULT 0,
	`averageScore` decimal(5,2) DEFAULT '0',
	`lastRevisedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userTopicProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `boardExamQuestions` MODIFY COLUMN `questionType` enum('mcq','shortAnswer','longAnswer','numericalProblem','assertion','matrix') NOT NULL;--> statement-breakpoint
ALTER TABLE `boardExamQuestions` MODIFY COLUMN `difficulty` enum('easy','medium','hard','veryHard') NOT NULL DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `boardExamQuestions` ADD `class` enum('11','12','jeeMain','jeeAdvanced') DEFAULT '12' NOT NULL;--> statement-breakpoint
ALTER TABLE `boardExamQuestions` ADD `negativeMarks` decimal(3,1) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `boardExamQuestions` ADD `year` int;--> statement-breakpoint
ALTER TABLE `boardExamQuestions` ADD `topic` varchar(255);--> statement-breakpoint
ALTER TABLE `pdfDocuments` ADD `class` enum('11','12','jeeMain','jeeAdvanced') DEFAULT '12';--> statement-breakpoint
ALTER TABLE `pdfDocuments` ADD `topic` varchar(255);--> statement-breakpoint
ALTER TABLE `pdfDocuments` ADD `resourceType` enum('notes','pyq','mock','solution','formula','other') DEFAULT 'notes';