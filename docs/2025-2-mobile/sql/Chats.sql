CREATE TABLE `Chats` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `SenderAccountId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `ReceiverAccountId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `CreatedAt` bigint NOT NULL,
  `UpdatedAt` bigint NOT NULL,
  `Removed` tinyint(1) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
