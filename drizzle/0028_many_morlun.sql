CREATE TABLE `syllabusChapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subject` varchar(100) NOT NULL,
	`chapter` varchar(255) NOT NULL,
	`class` enum('11','12','jeeMain','jeeAdvanced') NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `syllabusChapters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `jeeSyllabusTopics` ADD `chapterId` int;