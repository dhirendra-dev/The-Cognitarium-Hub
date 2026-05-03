CREATE TABLE `studyMaterials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`description` text,
	`resourceType` enum('googleDrive','telegram','website','pdf','video') NOT NULL DEFAULT 'googleDrive',
	`url` text NOT NULL,
	`author` varchar(255),
	`subject` varchar(100),
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'intermediate',
	`isPopular` boolean DEFAULT false,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `studyMaterials_id` PRIMARY KEY(`id`)
);
