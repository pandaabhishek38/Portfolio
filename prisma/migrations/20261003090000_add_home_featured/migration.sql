-- Independent Home-page selection and ordering for Projects and Skills.
-- The full Projects / Skills pages keep using displayOrder (unchanged).
--
-- Non-destructive: adds columns with defaults (not featured, order 0),
-- then backfills the selection Home showed before this change so the
-- Home page looks the same right after deploy:
--   * Projects: the first 3 in Projects-page order (displayOrder, id)
--   * Skills:   the first 12 distinct names in Skills-page order
--               (category order, then order within category)
-- homeDisplayOrder is 1-based for featured rows.

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "featuredOnHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "homeDisplayOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "featuredOnHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "homeDisplayOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill: projects
UPDATE "Project" AS p
SET "featuredOnHome" = true,
    "homeDisplayOrder" = o.position
FROM (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "displayOrder", "id")::INTEGER AS position
    FROM "Project"
) AS o
WHERE p."id" = o."id" AND o.position <= 3;

-- Backfill: skills (categories with a saved order first, then by first
-- appearance; skills by their order within the category; one per name)
WITH ordered AS (
    SELECT s."id",
           LOWER(TRIM(s."name")) AS name_key,
           ROW_NUMBER() OVER (
               ORDER BY (st."displayOrder" IS NULL), st."displayOrder", t.first_id,
                        s."displayOrder", s."id"
           ) AS position
    FROM "Skill" AS s
    JOIN (SELECT "type", MIN("id") AS first_id FROM "Skill" GROUP BY "type") AS t
      ON t."type" = s."type"
    LEFT JOIN "SkillType" AS st ON st."name" = s."type"
    WHERE TRIM(s."name") <> ''
),
first_per_name AS (
    SELECT DISTINCT ON (name_key) "id", position
    FROM ordered
    ORDER BY name_key, position
),
picked AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY position)::INTEGER AS home_position
    FROM first_per_name
)
UPDATE "Skill" AS s
SET "featuredOnHome" = true,
    "homeDisplayOrder" = picked.home_position
FROM picked
WHERE s."id" = picked."id" AND picked.home_position <= 12;
