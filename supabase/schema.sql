CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Property table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  source_url TEXT,
  title TEXT,
  neighborhood TEXT,
  city TEXT,
  price NUMERIC,
  bedrooms INT,
  bathrooms INT,
  parking_spots INT,
  area_m2 NUMERIC,
  description TEXT,
  instagram_caption TEXT,
  hashtags TEXT,
  images TEXT[] DEFAULT '{}',
  cover_image_url TEXT
);

-- RLS policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- If policy exists, drop it first to ensure clean state
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  USING (auth.uid() = user_id);
