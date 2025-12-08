/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `ContractType` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ContractType_name_key";

-- AlterTable
ALTER TABLE "ContractType" ADD COLUMN     "type" "JobType" NOT NULL DEFAULT 'FULL_TIME';

-- CreateIndex
CREATE UNIQUE INDEX "ContractType_type_key" ON "ContractType"("type");
