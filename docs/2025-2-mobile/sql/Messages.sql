CREATE TABLE `Messages` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ChatId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `AccountId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Content` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `CreatedAt` bigint NOT NULL,
  `UpdatedAt` bigint NOT NULL,
  `Removed` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Messages_ChatId` (`ChatId`),
  CONSTRAINT `FK_Messages_Chats_ChatId` FOREIGN KEY (`ChatId`) REFERENCES `Chats` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
