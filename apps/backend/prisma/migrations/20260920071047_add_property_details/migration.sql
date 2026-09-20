/*
  Add property details safely for existing properties.
*/

-- Add columns first.
ALTER TABLE "Property"
ADD COLUMN "checkInTime" TEXT NOT NULL DEFAULT '14:00',
ADD COLUMN "checkOutTime" TEXT NOT NULL DEFAULT '12:00',
ADD COLUMN "city" TEXT;

-- Existing properties do not have a city yet.
-- Use an empty string temporarily so the existing row remains valid.
UPDATE "Property"
SET "city" = ''
WHERE "city" IS NULL;

-- New properties must always have a city.
ALTER TABLE "Property"
ALTER COLUMN "city" SET NOT NULL;