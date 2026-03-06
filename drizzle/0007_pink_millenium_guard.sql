CREATE TABLE `internetStudyResources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`resourceType` enum('website','youtube','pdf','mockTest','pyq','book','course','community') NOT NULL,
	`subject` varchar(100),
	`class` enum('11','12','jeeMain','jeeAdvanced','all') DEFAULT 'all',
	`difficulty` enum('beginner','intermediate','advanced','all') DEFAULT 'all',
	`platform` varchar(100),
	`isFree` boolean DEFAULT true,
	`rating` decimal(3,1) DEFAULT '0',
	`reviewCount` int DEFAULT 0,
	`accessCount` int DEFAULT 0,
	`isVerified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internetStudyResources_id` PRIMARY KEY(`id`)
);
