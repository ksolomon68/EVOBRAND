-- Enable net extension for webhooks
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Webhook handler using pg_net
CREATE OR REPLACE FUNCTION handle_ticket_webhook()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://hllrpfnfusvaiwjknjge.functions.supabase.co/portal-notifications',
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW)
    )::text,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate triggers using the handler
DROP TRIGGER IF EXISTS on_ticket_created ON tickets;
CREATE TRIGGER on_ticket_created
AFTER INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION handle_ticket_webhook();

DROP TRIGGER IF EXISTS on_message_created ON ticket_messages;
CREATE TRIGGER on_message_created
AFTER INSERT ON ticket_messages
FOR EACH ROW EXECUTE FUNCTION handle_ticket_webhook();
