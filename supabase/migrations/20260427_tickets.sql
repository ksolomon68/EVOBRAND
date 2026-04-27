-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Pending', 'Resolved')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    category TEXT
);

-- Ticket Messages Table (Threading)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    sender_type TEXT CHECK (sender_type IN ('Client', 'Staff')),
    message TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Tickets
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tickets' AND policyname='Clients can view their own tickets') THEN
        CREATE POLICY "Clients can view their own tickets" ON tickets FOR SELECT USING (auth.uid() = client_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tickets' AND policyname='Clients can create their own tickets') THEN
        CREATE POLICY "Clients can create their own tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() = client_id);
    END IF;
END $$;

-- Policies for Ticket Messages
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ticket_messages' AND policyname='Clients can view messages for their own tickets') THEN
        CREATE POLICY "Clients can view messages for their own tickets" ON ticket_messages FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM tickets WHERE id = ticket_messages.ticket_id AND client_id = auth.uid()
            )
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ticket_messages' AND policyname='Clients can insert messages to their own tickets') THEN
        CREATE POLICY "Clients can insert messages to their own tickets" ON ticket_messages FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM tickets WHERE id = ticket_messages.ticket_id AND client_id = auth.uid()
            )
        );
    END IF;
END $$;
