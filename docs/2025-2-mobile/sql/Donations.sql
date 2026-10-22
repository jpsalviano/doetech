CREATE TABLE `Donations` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `RecipientAccountId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Removed` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` bigint NOT NULL,
  `UpdatedAt` bigint NOT NULL,
  `FinishedAt` bigint NOT NULL,
  `RowVersion` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
