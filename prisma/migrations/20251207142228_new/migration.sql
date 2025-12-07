/*
  Warnings:

  - You are about to drop the column `domain` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `responsibilities` on the `Job` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,countryId]` on the table `City` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "domain",
DROP COLUMN "responsibilities",
ADD COLUMN     "competencies" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "City_name_countryId_key" ON "City"("name", "countryId");
