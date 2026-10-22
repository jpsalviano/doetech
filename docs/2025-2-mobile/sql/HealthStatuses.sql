CREATE TABLE `HealthStatuses` (
  `build` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `version` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `name` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `releaseDate` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `code` int NOT NULL,
  PRIMARY KEY (`build`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
