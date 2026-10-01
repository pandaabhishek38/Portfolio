-- Optional company/organization logo for Experience entries.
-- Non-destructive: adds a nullable column; existing rows are untouched
-- (logoUrl is NULL, so the public card shows the monogram placeholder).

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "logoUrl" TEXT;
