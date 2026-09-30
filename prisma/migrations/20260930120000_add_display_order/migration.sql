-- Admin-controlled display ordering for Projects, Experience, Skills
-- and skill categories (Skill.type).
--
-- Non-destructive: only adds columns / a table. Existing rows are
-- backfilled so the current public order is preserved:
--   * Projects / Experience were shown by id ascending.
--   * Skill categories were shown by first appearance (lowest skill id),
--     and skills within a category by id ascending.

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SkillType" (
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SkillType_pkey" PRIMARY KEY ("name")
);

-- Backfill: preserve the existing order (0-based)
UPDATE "Project" AS p
SET "displayOrder" = o.position
FROM (
    SELECT "id", (ROW_NUMBER() OVER (ORDER BY "id") - 1)::INTEGER AS position
    FROM "Project"
) AS o
WHERE p."id" = o."id";

UPDATE "Experience" AS e
SET "displayOrder" = o.position
FROM (
    SELECT "id", (ROW_NUMBER() OVER (ORDER BY "id") - 1)::INTEGER AS position
    FROM "Experience"
) AS o
WHERE e."id" = o."id";

UPDATE "Skill" AS s
SET "displayOrder" = o.position
FROM (
    SELECT "id", (ROW_NUMBER() OVER (PARTITION BY "type" ORDER BY "id") - 1)::INTEGER AS position
    FROM "Skill"
) AS o
WHERE s."id" = o."id";

INSERT INTO "SkillType" ("name", "displayOrder")
SELECT "type", (ROW_NUMBER() OVER (ORDER BY MIN("id")) - 1)::INTEGER
FROM "Skill"
GROUP BY "type";
