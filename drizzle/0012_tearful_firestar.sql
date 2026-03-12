ALTER TABLE `leaderboard` ADD `adminRank` int;--> statement-breakpoint
ALTER TABLE `leaderboard` ADD `bonusPoints` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `leaderboard` ADD `isRankLocked` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `leaderboard` ADD `rankLockedBy` int;--> statement-breakpoint
ALTER TABLE `leaderboard` ADD `rankNotes` text;--> statement-breakpoint
ALTER TABLE `leaderboard` ADD `lastRankedBy` int;--> statement-breakpoint
ALTER TABLE `leaderboard` ADD `lastRankedAt` timestamp;