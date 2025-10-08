/*
  Warnings:

  - You are about to drop the column `name` on the `file` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `file` DROP COLUMN `name`;

-- CreateTable
CREATE TABLE `Job` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jobTitle` VARCHAR(191) NOT NULL,
    `cvId` INTEGER NOT NULL,
    `reportId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'queued',
    `cvMatchRate` DOUBLE NULL,
    `cvFeedback` VARCHAR(191) NULL,
    `projectScore` DOUBLE NULL,
    `projectFeedback` VARCHAR(191) NULL,
    `overallSummary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `File`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `File`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
