CREATE TABLE `certificateEligibilityCriteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificateType` enum('activeMember','topContributor','helpfulCommunity','consistentLearner','leaderboardTop10','courseCompletion','quizMastery','studyStreak') NOT NULL,
	`minPostCount` int DEFAULT 0,
	`minLikesReceived` int DEFAULT 0,
	`minRepliesCount` int DEFAULT 0,
	`minStudyHours` decimal(6,2) DEFAULT '0',
	`minLeaderboardRank` int,
	`minConsecutiveDays` int DEFAULT 0,
	`minCourseCompletion` int DEFAULT 0,
	`minQuizScore` decimal(5,2) DEFAULT '0',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certificateEligibilityCriteria_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificateEligibilityCriteria_certificateType_unique` UNIQUE(`certificateType`)
);
--> statement-breakpoint
CREATE TABLE `communityContributionCertificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`certificateType` enum('activeMember','topContributor','helpfulCommunity','consistentLearner','leaderboardTop10','courseCompletion','quizMastery','studyStreak') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`contributionMetric` varchar(100),
	`certificateUrl` text,
	`certificateKey` varchar(500),
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`verificationCode` varchar(64),
	`isDownloaded` boolean DEFAULT false,
	`downloadedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityContributionCertificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `communityContributionCertificates_verificationCode_unique` UNIQUE(`verificationCode`)
);
