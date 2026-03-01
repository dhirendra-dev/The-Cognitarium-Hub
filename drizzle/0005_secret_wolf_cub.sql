CREATE TABLE `pdfDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`uploadedBy` int NOT NULL,
	`isPublic` boolean DEFAULT true,
	`downloadCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pdfDocuments_id` PRIMARY KEY(`id`)
);
