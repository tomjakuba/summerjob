-- AlterTable
ALTER TABLE "Application"
RENAME COLUMN "allergies" TO "foodAllergies",
ADD COLUMN "workAllergies" TEXT;
