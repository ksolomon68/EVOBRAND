CREATE TABLE IF NOT EXISTS brand_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  business_name TEXT NOT NULL,
  industry TEXT,
  email TEXT NOT NULL,
  first_name TEXT,
  phone TEXT,
  wants_call BOOLEAN DEFAULT FALSE,
  form_answers JSONB,
  overall_score INTEGER,
  grade TEXT,
  full_report JSONB,
  status TEXT DEFAULT 'completed'
);

ALTER TABLE brand_audits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='brand_audits' AND policyname='Service role full access') THEN
    CREATE POLICY "Service role full access" ON brand_audits FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='brand_audits' AND policyname='Anyone can submit audit') THEN
    CREATE POLICY "Anyone can submit audit" ON brand_audits FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='brand_audits' AND policyname='Anyone can view audit by id') THEN
    CREATE POLICY "Anyone can view audit by id" ON brand_audits FOR SELECT TO anon USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS brand_audits_email_idx ON brand_audits (email);
CREATE INDEX IF NOT EXISTS brand_audits_created_at_idx ON brand_audits (created_at DESC);
