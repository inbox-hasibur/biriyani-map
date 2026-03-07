-- Supabase schema for Universal Map

-- users table (Supabase Auth will handle most of this)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════
-- LAYER 1: BIRIYANI SPOTS
-- ═══════════════════════════════════════════

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

CREATE TABLE IF NOT EXISTS spot_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id uuid REFERENCES spots(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  value integer NOT NULL CHECK (value IN (1, -1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE (spot_id, user_id)
);

-- Trigger: update spots.score
CREATE OR REPLACE FUNCTION update_spot_score() RETURNS trigger AS $$
BEGIN
  UPDATE spots
  SET score = COALESCE((SELECT SUM(value) FROM spot_votes WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id)), 0)
  WHERE id = COALESCE(NEW.spot_id, OLD.spot_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_spot_score ON spot_votes;
CREATE TRIGGER trg_update_spot_score
AFTER INSERT OR UPDATE OR DELETE ON spot_votes
FOR EACH ROW EXECUTE FUNCTION update_spot_score();

-- ═══════════════════════════════════════════
-- LAYER 2: TOILETS
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS toilets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  is_paid boolean DEFAULT false,
  has_water boolean DEFAULT true,
  notes text,
  rating_avg numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  score integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS toilets_lat_lng_idx ON toilets (lat, lng);

CREATE TABLE IF NOT EXISTS toilet_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  toilet_id uuid REFERENCES toilets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  value integer NOT NULL CHECK (value IN (1, -1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE (toilet_id, user_id)
);

CREATE OR REPLACE FUNCTION update_toilet_score() RETURNS trigger AS $$
BEGIN
  UPDATE toilets
  SET score = COALESCE((SELECT SUM(value) FROM toilet_votes WHERE toilet_id = COALESCE(NEW.toilet_id, OLD.toilet_id)), 0)
  WHERE id = COALESCE(NEW.toilet_id, OLD.toilet_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_toilet_score ON toilet_votes;
CREATE TRIGGER trg_update_toilet_score
AFTER INSERT OR UPDATE OR DELETE ON toilet_votes
FOR EACH ROW EXECUTE FUNCTION update_toilet_score();

CREATE TABLE IF NOT EXISTS toilet_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  toilet_id uuid REFERENCES toilets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Trigger: update toilet rating averages
CREATE OR REPLACE FUNCTION update_toilet_rating() RETURNS trigger AS $$
BEGIN
  UPDATE toilets
  SET rating_avg = COALESCE((SELECT AVG(rating) FROM toilet_reviews WHERE toilet_id = COALESCE(NEW.toilet_id, OLD.toilet_id)), 0),
      rating_count = COALESCE((SELECT COUNT(*) FROM toilet_reviews WHERE toilet_id = COALESCE(NEW.toilet_id, OLD.toilet_id)), 0)
  WHERE id = COALESCE(NEW.toilet_id, OLD.toilet_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_toilet_rating ON toilet_reviews;
CREATE TRIGGER trg_update_toilet_rating
AFTER INSERT OR UPDATE OR DELETE ON toilet_reviews
FOR EACH ROW EXECUTE FUNCTION update_toilet_rating();

-- ═══════════════════════════════════════════
-- LAYER 3: GOODS PRICING
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS goods_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  price numeric NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  shop_name text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  score integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS goods_lat_lng_idx ON goods_prices (lat, lng);
CREATE INDEX IF NOT EXISTS goods_product_idx ON goods_prices (product_name);

CREATE TABLE IF NOT EXISTS goods_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_id uuid REFERENCES goods_prices(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  value integer NOT NULL CHECK (value IN (1, -1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE (goods_id, user_id)
);

CREATE OR REPLACE FUNCTION update_goods_score() RETURNS trigger AS $$
BEGIN
  UPDATE goods_prices
  SET score = COALESCE((SELECT SUM(value) FROM goods_votes WHERE goods_id = COALESCE(NEW.goods_id, OLD.goods_id)), 0)
  WHERE id = COALESCE(NEW.goods_id, OLD.goods_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_goods_score ON goods_votes;
CREATE TRIGGER trg_update_goods_score
AFTER INSERT OR UPDATE OR DELETE ON goods_votes
FOR EACH ROW EXECUTE FUNCTION update_goods_score();

-- ═══════════════════════════════════════════
-- LAYER 4: VIOLENCE REPORTS
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS violence_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  incident_type text NOT NULL DEFAULT 'Other',
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  score integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS violence_lat_lng_idx ON violence_reports (lat, lng);
CREATE INDEX IF NOT EXISTS violence_type_idx ON violence_reports (incident_type);

CREATE TABLE IF NOT EXISTS violence_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES violence_reports(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  value integer NOT NULL CHECK (value IN (1, -1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE (report_id, user_id)
);

CREATE OR REPLACE FUNCTION update_violence_score() RETURNS trigger AS $$
BEGIN
  UPDATE violence_reports
  SET score = COALESCE((SELECT SUM(value) FROM violence_votes WHERE report_id = COALESCE(NEW.report_id, OLD.report_id)), 0),
      upvotes = COALESCE((SELECT COUNT(*) FROM violence_votes WHERE report_id = COALESCE(NEW.report_id, OLD.report_id) AND value = 1), 0),
      downvotes = COALESCE((SELECT COUNT(*) FROM violence_votes WHERE report_id = COALESCE(NEW.report_id, OLD.report_id) AND value = -1), 0)
  WHERE id = COALESCE(NEW.report_id, OLD.report_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_violence_score ON violence_votes;
CREATE TRIGGER trg_update_violence_score
AFTER INSERT OR UPDATE OR DELETE ON violence_votes
FOR EACH ROW EXECUTE FUNCTION update_violence_score();

CREATE TABLE IF NOT EXISTS violence_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES violence_reports(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════
-- AUTO-HIDE on negative score (all layers)
-- ═══════════════════════════════════════════

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

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;
