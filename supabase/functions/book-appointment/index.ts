import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { clientName, clientEmail, service, date, timeSlot, notes, clientId } =
      await req.json();

    if (!clientName || !clientEmail || !service || !date || !timeSlot) {
      return json({ error: "Missing required fields." }, 400);
    }

    if (!TIME_SLOTS.includes(timeSlot)) {
      return json({ error: "Invalid time slot." }, 400);
    }

    // Check blackout — whole day (null slot) OR specific slot
    const { data: blackout } = await supabase
      .from("blackout_dates")
      .select("id")
      .eq("blackout_date", date)
      .or(`time_slot.is.null,time_slot.eq.${timeSlot}`)
      .maybeSingle();

    if (blackout) {
      return json({ error: "This time is no longer available. Please choose another slot." }, 409);
    }

    // Check for existing confirmed booking on the same slot
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_date", date)
      .eq("time_slot", timeSlot)
      .eq("status", "confirmed")
      .maybeSingle();

    if (existing) {
      return json({ error: "This slot was just booked. Please choose another time." }, 409);
    }

    // Create Google Calendar event (non-fatal if credentials missing)
    let googleEventId: string | null = null;
    try {
      googleEventId = await createCalendarEvent({ clientName, clientEmail, service, date, timeSlot, notes });
    } catch (calErr) {
      console.error("Google Calendar error (non-fatal):", calErr);
    }

    // Insert booking
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .insert({
        client_id: clientId ?? null,
        client_name: clientName,
        client_email: clientEmail,
        service,
        booking_date: date,
        time_slot: timeSlot,
        notes: notes ?? null,
        google_event_id: googleEventId,
      })
      .select()
      .single();

    if (bookingErr) throw bookingErr;

    // Send emails (non-fatal)
    await sendEmails({ clientName, clientEmail, service, date, timeSlot, notes }).catch(
      (err) => console.error("Email error (non-fatal):", err)
    );

    return json({ success: true, bookingId: booking.id });
  } catch (err) {
    console.error(err);
    return json({ error: "Internal server error." }, 500);
  }
});

// ─── Google Calendar ──────────────────────────────────────────────────────────

async function createCalendarEvent(params: {
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  timeSlot: string;
  notes?: string;
}): Promise<string> {
  const serviceAccountRaw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
  const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
  if (!serviceAccountRaw || !calendarId) throw new Error("Google credentials not configured");

  const serviceAccount = JSON.parse(serviceAccountRaw);
  const token = await getGoogleToken(serviceAccount);

  const { startISO, endISO } = slotToISO(params.date, params.timeSlot);

  const event = {
    summary: `EVOBRAND Consultation — ${params.clientName}`,
    description: [
      `Service: ${params.service}`,
      `Client: ${params.clientName}`,
      `Email: ${params.clientEmail}`,
      params.notes ? `Notes: ${params.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: startISO, timeZone: "America/Chicago" },
    end: { dateTime: endISO, timeZone: "America/Chicago" },
    attendees: [{ email: params.clientEmail }],
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(event),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.id as string;
}

async function getGoogleToken(sa: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );

  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc(signingInput));
  const jwt = `${signingInput}.${b64url(sig)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const { access_token } = await res.json();
  return access_token;
}

function slotToISO(date: string, slot: string): { startISO: string; endISO: string } {
  const [timePart, period] = slot.split(" ");
  let [h, m] = timePart.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  const startISO = `${date}T${pad(h)}:${pad(m ?? 0)}:00`;
  const end = new Date(`${startISO}`);
  end.setMinutes(end.getMinutes() + 30);
  const endISO = end.toISOString().slice(0, 19);
  return { startISO, endISO };
}

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

function b64url(input: string | ArrayBuffer): string {
  const str =
    typeof input === "string"
      ? btoa(input)
      : btoa(String.fromCharCode(...new Uint8Array(input)));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function enc(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

// ─── Email ────────────────────────────────────────────────────────────────────

async function sendEmails(params: {
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  timeSlot: string;
  notes?: string;
}) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return;

  const formattedDate = new Date(`${params.date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const send = (payload: object) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  // Confirmation to client
  await send({
    from: "EVOBRAND <no-reply@evobrand.net>",
    to: [params.clientEmail],
    subject: `Consultation Confirmed — ${formattedDate} at ${params.timeSlot}`,
    html: clientConfirmationHtml({ ...params, formattedDate }),
  });

  // Internal notification to admin
  await send({
    from: "EVOBRAND Scheduler <no-reply@evobrand.net>",
    to: ["info@evobrand.net"],
    subject: `New Booking: ${params.clientName} — ${formattedDate} at ${params.timeSlot}`,
    html: adminNotificationHtml({ ...params, formattedDate }),
  });
}

function clientConfirmationHtml(p: {
  clientName: string;
  service: string;
  formattedDate: string;
  timeSlot: string;
  notes?: string;
}): string {
  return `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0A1628;color:#E8DDD0;padding:48px 40px;border-radius:12px;">
  <div style="border-bottom:2px solid #22c8e5;padding-bottom:24px;margin-bottom:32px;">
    <h1 style="color:#22c8e5;font-size:26px;margin:0;letter-spacing:0.05em;">Consultation Confirmed</h1>
    <p style="color:#E8DDD0;opacity:0.5;margin:8px 0 0;font-size:13px;letter-spacing:0.1em;">EVOBRAND · Dallas, Texas</p>
  </div>
  <p style="font-size:17px;">Hello <strong>${p.clientName}</strong>,</p>
  <p style="color:rgba(232,221,208,0.8);">Your consultation has been confirmed. A Google Meet link has been sent to your calendar invitation.</p>
  <div style="background:rgba(34,200,229,0.08);border:1px solid rgba(34,200,229,0.4);border-radius:10px;padding:28px;margin:28px 0;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:10px 0;color:#22c8e5;font-weight:bold;width:38%;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Service</td><td style="color:#E8DDD0;">${p.service}</td></tr>
      <tr><td style="padding:10px 0;color:#22c8e5;font-weight:bold;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Date</td><td style="color:#E8DDD0;">${p.formattedDate}</td></tr>
      <tr><td style="padding:10px 0;color:#22c8e5;font-weight:bold;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Time</td><td style="color:#E8DDD0;">${p.timeSlot} CST</td></tr>
      <tr><td style="padding:10px 0;color:#22c8e5;font-weight:bold;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Duration</td><td style="color:#E8DDD0;">30 minutes</td></tr>
      ${p.notes ? `<tr><td style="padding:10px 0;color:#22c8e5;font-weight:bold;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Notes</td><td style="color:#E8DDD0;">${p.notes}</td></tr>` : ""}
    </table>
  </div>
  <p style="color:rgba(232,221,208,0.7);font-size:14px;">To reschedule or cancel, email <a href="mailto:info@evobrand.net" style="color:#22c8e5;">info@evobrand.net</a> at least 24 hours in advance.</p>
  <div style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(34,200,229,0.2);display:flex;align-items:center;justify-content:space-between;">
    <span style="color:rgba(232,221,208,0.35);font-size:12px;letter-spacing:0.08em;">EVOBRAND · +1 214-531-4427</span>
  </div>
</div>`;
}

function adminNotificationHtml(p: {
  clientName: string;
  clientEmail: string;
  service: string;
  formattedDate: string;
  timeSlot: string;
  notes?: string;
}): string {
  return `
<div style="font-family:Georgia,serif;max-width:600px;background:#0A1628;color:#E8DDD0;padding:40px;border-radius:12px;">
  <h2 style="color:#22c8e5;border-bottom:2px solid #22c8e5;padding-bottom:16px;">New Consultation Booked</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#22c8e5;font-weight:bold;width:35%;">Client</td><td>${p.clientName}</td></tr>
    <tr><td style="padding:8px 0;color:#22c8e5;font-weight:bold;">Email</td><td><a href="mailto:${p.clientEmail}" style="color:#22c8e5;">${p.clientEmail}</a></td></tr>
    <tr><td style="padding:8px 0;color:#22c8e5;font-weight:bold;">Service</td><td>${p.service}</td></tr>
    <tr><td style="padding:8px 0;color:#22c8e5;font-weight:bold;">Date</td><td>${p.formattedDate}</td></tr>
    <tr><td style="padding:8px 0;color:#22c8e5;font-weight:bold;">Time</td><td>${p.timeSlot} CST</td></tr>
    ${p.notes ? `<tr><td style="padding:8px 0;color:#22c8e5;font-weight:bold;">Notes</td><td>${p.notes}</td></tr>` : ""}
  </table>
</div>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
