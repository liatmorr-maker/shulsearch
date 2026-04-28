-- Add multi-faith worship place support (Fair Housing compliance)

-- New enum for worship type
CREATE TYPE "PlaceOfWorshipType" AS ENUM ('SYNAGOGUE', 'CHURCH', 'MOSQUE');

-- Add worship_type to synagogues table (existing rows default to SYNAGOGUE)
ALTER TABLE synagogues
  ADD COLUMN "worshipType" "PlaceOfWorshipType" NOT NULL DEFAULT 'SYNAGOGUE';

-- Add nearest church / mosque distance columns to properties
ALTER TABLE properties
  ADD COLUMN "nearestChurchId"   TEXT,
  ADD COLUMN "nearestChurchDist" FLOAT8,
  ADD COLUMN "nearestMosqueId"   TEXT,
  ADD COLUMN "nearestMosqueDist" FLOAT8;
