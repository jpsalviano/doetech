CREATE TABLE `DonationEquipments` (
  `Id` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `DonationId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `EquipmentId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_DonationEquipments_DonationId_EquipmentId` (`DonationId`,`EquipmentId`),
  CONSTRAINT `FK_DonationEquipments_Donations_DonationId` FOREIGN KEY (`DonationId`) REFERENCES `Donations` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
