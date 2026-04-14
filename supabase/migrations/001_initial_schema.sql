-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "Denomination" AS ENUM (
  'ORTHODOX', 'MODERN_ORTHODOX', 'CONSERVATIVE', 'REFORM',
  'RECONSTRUCTIONIST', 'SEPHARDIC', 'CHABAD', 'OTHER'
);
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'PENDING', 'SOLD', 'RENTED', 'INACTIVE');

-- Users
CREATE TABLE users (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clerkId"   TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  "avatarUrl" TEXT,
  role        "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Synagogues
CREATE TABLE synagogues (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name           TEXT NOT NULL,
  denomination   "Denomination" NOT NULL,
  address        TEXT NOT NULL,
  city           TEXT NOT NULL,
  state          TEXT NOT NULL,
  zip            TEXT NOT NULL,
  phone          TEXT,
  email          TEXT,
  website        TEXT,
  lat            FLOAT8 NOT NULL,
  lng            FLOAT8 NOT NULL,
  location       GEOGRAPHY(Point, 4326),  -- PostGIS column
  description    TEXT,
  "imageUrl"     TEXT,
  "isVerified"   BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-populate location from lat/lng on insert/update
CREATE OR REPLACE FUNCTION sync_synagogue_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER synagogue_location_sync
BEFORE INSERT OR UPDATE OF lat, lng ON synagogues
FOR EACH ROW EXECUTE FUNCTION sync_synagogue_location();

-- Properties
CREATE TABLE properties (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "externalId"            TEXT UNIQUE,
  title                   TEXT NOT NULL,
  description             TEXT,
  address                 TEXT NOT NULL,
  city                    TEXT NOT NULL,
  state                   TEXT NOT NULL,
  zip                     TEXT NOT NULL,
  neighborhood            TEXT,
  lat                     FLOAT8 NOT NULL,
  lng                     FLOAT8 NOT NULL,
  location                GEOGRAPHY(Point, 4326),  -- PostGIS column
  "listingType"           "ListingType" NOT NULL,
  status                  "PropertyStatus" NOT NULL DEFAULT 'ACTIVE',
  price                   INT NOT NULL,
  beds                    INT NOT NULL,
  baths                   FLOAT8 NOT NULL,
  sqft                    INT,
  "yearBuilt"             INT,
  "imageUrls"             TEXT[] NOT NULL DEFAULT '{}',
  amenities               TEXT[] NOT NULL DEFAULT '{}',
  "nearestSynagogueId"    TEXT REFERENCES synagogues(id),
  "nearestSynagugueDist"  FLOAT8,
  "synagogueCount1mi"     INT NOT NULL DEFAULT 0,
  "proximityScore"        FLOAT8,
  "isApproved"            BOOLEAN NOT NULL DEFAULT FALSE,
  "isFeatured"            BOOLEAN NOT NULL DEFAULT FALSE,
  "listedAt"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-populate location from lat/lng
CREATE OR REPLACE FUNCTION sync_property_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_location_sync
BEFORE INSERT OR UPDATE OF lat, lng ON properties
FOR EACH ROW EXECUTE FUNCTION sync_property_location();

-- Property-Synagogue distances
CREATE TABLE property_synagogue_distances (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "propertyId"  TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  "synagogueId" TEXT NOT NULL REFERENCES synagogues(id) ON DELETE CASCADE,
  "distanceMi"  FLOAT8 NOT NULL,
  "walkMinutes" INT NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("propertyId", "synagogueId")
);

-- Saved properties
CREATE TABLE saved_properties (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "propertyId" TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "propertyId")
);

-- Saved synagogues
CREATE TABLE saved_synagogues (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "synagogueId" TEXT NOT NULL REFERENCES synagogues(id) ON DELETE CASCADE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "synagogueId")
);

-- Leads
CREATE TABLE leads (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT REFERENCES users(id),
  "propertyId" TEXT NOT NULL REFERENCES properties(id),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT,
  message      TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Searches
CREATE TABLE searches (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT REFERENCES users(id),
  query       TEXT NOT NULL,
  city        TEXT,
  zip         TEXT,
  filters     JSONB,
  "resultCnt" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- PostGIS spatial indexes
CREATE INDEX synagogues_location_gix   ON synagogues USING GIST (location);
CREATE INDEX properties_location_gix   ON properties USING GIST (location);

-- Lookup indexes
CREATE INDEX properties_city_idx            ON properties (city);
CREATE INDEX properties_zip_idx             ON properties (zip);
CREATE INDEX properties_listing_type_idx    ON properties ("listingType");
CREATE INDEX properties_status_idx          ON properties (status);
CREATE INDEX properties_price_idx           ON properties (price);
CREATE INDEX properties_beds_idx            ON properties (beds);
CREATE INDEX properties_proximity_score_idx ON properties ("proximityScore" DESC NULLS LAST);
CREATE INDEX properties_nearest_shul_idx    ON properties ("nearestSynagogueId");

CREATE INDEX psd_property_idx   ON property_synagogue_distances ("propertyId");
CREATE INDEX psd_synagogue_idx  ON property_synagogue_distances ("synagogueId");
CREATE INDEX psd_distance_idx   ON property_synagogue_distances ("distanceMi");

-- ─── Ranking function ────────────────────────────────────────────────────────

-- proximityScore = (1/distance_to_nearest_shul * 5) + (synagogue_count_1mi * 0.8) + (freshness_score * 1.5)
CREATE OR REPLACE FUNCTION compute_proximity_score(
  nearest_dist_mi   FLOAT8,
  shul_count_1mi    INT,
  listed_at         TIMESTAMPTZ
) RETURNS FLOAT8 AS $$
DECLARE
  freshness FLOAT8;
  days_old  FLOAT8;
BEGIN
  days_old  := EXTRACT(EPOCH FROM (NOW() - listed_at)) / 86400.0;
  freshness := GREATEST(0, 1.0 - (days_old / 90.0)); -- decay over 90 days
  RETURN
    CASE WHEN nearest_dist_mi IS NULL OR nearest_dist_mi = 0 THEN 0
    ELSE (1.0 / nearest_dist_mi * 5.0)
    END
    + (shul_count_1mi * 0.8)
    + (freshness * 1.5);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── Helper: find synagogues within radius ───────────────────────────────────

CREATE OR REPLACE FUNCTION synagogues_within_miles(
  prop_lat  FLOAT8,
  prop_lng  FLOAT8,
  radius_mi FLOAT8
)
RETURNS TABLE (
  id            TEXT,
  name          TEXT,
  denomination  "Denomination",
  address       TEXT,
  lat           FLOAT8,
  lng           FLOAT8,
  distance_mi   FLOAT8,
  walk_minutes  INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.denomination,
    s.address,
    s.lat,
    s.lng,
    ST_Distance(
      s.location,
      ST_SetSRID(ST_MakePoint(prop_lng, prop_lat), 4326)::geography
    ) / 1609.344 AS distance_mi,
    ROUND(
      ST_Distance(
        s.location,
        ST_SetSRID(ST_MakePoint(prop_lng, prop_lat), 4326)::geography
      ) / 1609.344 / 3.0 * 60.0
    )::INT AS walk_minutes
  FROM synagogues s
  WHERE ST_DWithin(
    s.location,
    ST_SetSRID(ST_MakePoint(prop_lng, prop_lat), 4326)::geography,
    radius_mi * 1609.344
  )
  ORDER BY distance_mi ASC;
END;
$$ LANGUAGE plpgsql STABLE;
