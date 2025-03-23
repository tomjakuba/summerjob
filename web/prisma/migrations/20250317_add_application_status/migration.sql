-- Vytvoření enum typu pro status
DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Přidání sloupce status do tabulky Application
ALTER TABLE "Application"
ADD COLUMN "status" "ApplicationStatus" NOT NULL DEFAULT 'pending';
