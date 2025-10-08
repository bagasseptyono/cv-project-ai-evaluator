/*
  Warnings:

  - You are about to drop the column `cvFeedback` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `cvMatchRate` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `overallSummary` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `projectFeedback` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `projectScore` on the `job` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `job` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[resultId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `job` DROP COLUMN `cvFeedback`,
    DROP COLUMN `cvMatchRate`,
    DROP COLUMN `overallSummary`,
    DROP COLUMN `projectFeedback`,
    DROP COLUMN `projectScore`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `resultId` INTEGER NULL;

-- CreateTable
CREATE TABLE `EvaluationResult` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cvScore` DOUBLE NULL,
    `cvFeedback` VARCHAR(191) NULL,
    `projectScore` DOUBLE NULL,
    `projectFeedback` VARCHAR(191) NULL,
    `overallSummary` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScoringRubric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScoringParameter` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rubricId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `weight` DOUBLE NOT NULL,
    `scaleDesc` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Job_resultId_key` ON `Job`(`resultId`);

-- AddForeignKey
ALTER TABLE `Job` ADD CONSTRAINT `Job_resultId_fkey` FOREIGN KEY (`resultId`) REFERENCES `EvaluationResult`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScoringParameter` ADD CONSTRAINT `ScoringParameter_rubricId_fkey` FOREIGN KEY (`rubricId`) REFERENCES `ScoringRubric`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
