-- Per-experience logo presentation: tile shape and zoom.
-- Non-destructive: adds two columns with defaults, so every existing row
-- gets logoShape = 'square' and logoZoom = 100 (the current appearance).
-- logoUrl is untouched.

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "logoShape" TEXT NOT NULL DEFAULT 'square',
ADD COLUMN     "logoZoom" INTEGER NOT NULL DEFAULT 100;
