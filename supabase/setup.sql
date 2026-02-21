-- Supabase schema for Iftar Maps

-- users table (Supabase Auth will handle most of this)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- spots table
CREATE TABLE IF NOT EXISTS spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  time timestamptz,
  food_type text,
  is_visible boolean DEFAULT true,
  score integer DEFAULT 0,
  verified boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS spots_lat_lng_idx ON spots (lat, lng);
CREATE INDEX IF NOT EXISTS spots_created_at_idx ON spots (created_at);

-- votes
CREATE TABLE IF NOT EXISTS spot_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  value integer NOT NULL CHECK (value IN (1, -1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE (spot_id, user_id)
);

-- Trigger: update spots.score after vote changes
CREATE OR REPLACE FUNCTION update_spot_score() RETURNS trigger AS $$
BEGIN
  UPDATE spots
  SET score = COALESCE((SELECT SUM(value) FROM spot_votes WHERE spot_id = NEW.spot_id), 0)
  WHERE id = NEW.spot_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_spot_score ON spot_votes;
CREATE TRIGGER trg_update_spot_score
AFTER INSERT OR UPDATE OR DELETE ON spot_votes
FOR EACH ROW EXECUTE FUNCTION update_spot_score();

-- Trigger to auto-hide
CREATE OR REPLACE FUNCTION auto_hide_on_negative_score() RETURNS trigger AS $$
DECLARE
  s integer;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    s := COALESCE((SELECT SUM(value) FROM spot_votes WHERE spot_id = OLD.spot_id), 0);
    IF s <= -5 THEN
      UPDATE spots SET is_visible = false WHERE id = OLD.spot_id;
    END IF;
    RETURN OLD;
  ELSE
    s := COALESCE((SELECT SUM(value) FROM spot_votes WHERE spot_id = NEW.spot_id), 0);
    IF s <= -5 THEN
      UPDATE spots SET is_visible = false WHERE id = NEW.spot_id;
    END IF;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_hide ON spot_votes;
CREATE TRIGGER trg_auto_hide
AFTER INSERT OR UPDATE OR DELETE ON spot_votes
FOR EACH ROW EXECUTE FUNCTION auto_hide_on_negative_score();

-- Note: enable pgcrypto extension (gen_random_uuid) if not already
CREATE EXTENSION IF NOT EXISTS pgcrypto;
