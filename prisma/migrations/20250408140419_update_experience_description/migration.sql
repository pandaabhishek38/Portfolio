/*
  Warnings:

  - You are about to drop the column `bullets` on the `Experience` table. All the data in the column will be lost.
  - Added the required column `description` to the `Experience` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "bullets",
ADD COLUMN     "description" TEXT NOT NULL;
