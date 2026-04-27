-- Bookings table for scheduled consultations
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    service TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    google_event_id TEXT,
    notes TEXT,
    duration_minutes INTEGER DEFAULT 30
);

-- Blackout dates — entire days (time_slot IS NULL) or specific slots
CREATE TABLE IF NOT EXISTS blackout_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    blackout_date DATE NOT NULL,
    time_slot TEXT,
    reason TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;

-- Bookings: clients can only read their own rows
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='bookings' AND policyname='clients_view_own_bookings'
    ) THEN
        CREATE POLICY "clients_view_own_bookings" ON bookings
            FOR SELECT USING (auth.uid() = client_id);
    END IF;
END $$;

-- Blackout dates: public read so the scheduler can check availability
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='blackout_dates' AND policyname='public_read_blackouts'
    ) THEN
        CREATE POLICY "public_read_blackouts" ON blackout_dates
            FOR SELECT TO public USING (true);
    END IF;
END $$;

-- Blackout dates: admin-only write (role stored in user_metadata)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename='blackout_dates' AND policyname='admin_manage_blackouts'
    ) THEN
        CREATE POLICY "admin_manage_blackouts" ON blackout_dates
            FOR ALL USING (
                (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
            );
    END IF;
END $$;

-- Unique constraint: no double-booking the same slot
CREATE UNIQUE INDEX IF NOT EXISTS bookings_date_slot_unique
    ON bookings (booking_date, time_slot)
    WHERE status = 'confirmed';
