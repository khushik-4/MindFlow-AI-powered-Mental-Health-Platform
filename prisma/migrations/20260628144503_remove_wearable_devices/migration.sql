/*
  Warnings:

  - You are about to drop the `WearableDevice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WearableMetric` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WearableDevice" DROP CONSTRAINT "WearableDevice_userId_fkey";

-- DropForeignKey
ALTER TABLE "WearableMetric" DROP CONSTRAINT "WearableMetric_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "WearableMetric" DROP CONSTRAINT "WearableMetric_userId_fkey";

-- DropTable
DROP TABLE "WearableDevice";

-- DropTable
DROP TABLE "WearableMetric";
