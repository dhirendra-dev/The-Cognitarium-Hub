CREATE TABLE `focusPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(100) NOT NULL,
	`intention` varchar(255) NOT NULL,
	`scheduledFor` timestamp NOT NULL,
	`duration` int NOT NULL,
	`timerMode` enum('pomodoro','custom','stopwatch') NOT NULL DEFAULT 'pomodoro',
	`status` enum('planned','started','dismissed') NOT NULL DEFAULT 'planned',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `focusPlans_id` PRIMARY KEY(`id`)
);
