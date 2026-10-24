-- Run once after `prisma migrate dev`. Speeds up "nearest providers" queries.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX IF NOT EXISTS provider_geo_idx
  ON "Provider"
  USING GIST ((ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography))
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Example: 5 nearest verified providers to a reporter at (lat 12.9716, lng 77.5946)
-- SELECT id, name, phones,
--        ST_Distance(ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
--                    ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography) AS metres
-- FROM "Provider"
-- WHERE verified = true AND lat IS NOT NULL
-- ORDER BY metres
-- LIMIT 5;
