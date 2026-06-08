const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { name, email, service, message } = await req.json();

    if (!name || !email || !message) {
      return json({ error: "name, email, and message are required." }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: "Invalid email address." }, 400);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const send = (payload: object) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

    // Notify admin
    await send({
      from: "EVOBRAND Website <no-reply@evobrand.net>",
      to: ["info@evobrand.net"],
      reply_to: email,
      subject: `New Inquiry — ${service || "General"} from ${name}`,
      html: adminHtml({ name, email, service, message }),
    });

    // Auto-reply to sender
    await send({
      from: "EVOBRAND <no-reply@evobrand.net>",
      to: [email],
      subject: "We received your message — EVOBRAND",
      html: autoReplyHtml(name),
    });

    return json({ success: true });
  } catch (err) {
    console.error(err);
    return json({ error: "Failed to send message. Please try again." }, 500);
  }
});

function adminHtml(p: { name: string; email: string; service?: string; message: string }): string {
  return `
<div style="font-family:Georgia,serif;max-width:600px;background:#0A1628;color:#E8DDD0;padding:40px;border-radius:12px;">
  <div style="border-bottom:2px solid #22c8e5;padding-bottom:20px;margin-bottom:28px;">
    <h2 style="color:#22c8e5;margin:0;font-size:22px;letter-spacing:0.05em;">New Website Inquiry</h2>
    <p style="color:rgba(232,221,208,0.45);margin:6px 0 0;font-size:12px;letter-spacing:0.1em;">EVOBRAND CONTACT FORM</p>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <tr><td style="padding:10px 0;color:#22c8e5;font-weight:bold;width:36%;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Name</td><td>${p.name}</td></tr>
    <tr><td style="padding:10px 0;color:#22c8e5;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Email</td><td><a href="mailto:${p.email}" style="color:#22c8e5;">${p.email}</a></td></tr>
    ${p.service ? `<tr><td style="padding:10px 0;color:#22c8e5;font-weight:bold;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;">Service</td><td>${p.service}</td></tr>` : ""}
  </table>
  <div style="background:rgba(34,200,229,0.08);border-left:3px solid #22c8e5;border-radius:0 8px 8px 0;padding:20px 24px;">
    <p style="color:#22c8e5;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">Message</p>
    <p style="margin:0;line-height:1.7;color:#E8DDD0;">${p.message.replace(/\n/g, "<br>")}</p>
  </div>
</div>`;
}

function autoReplyHtml(name: string): string {
  return `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#0A1628;color:#E8DDD0;padding:48px 40px;border-radius:12px;">
  <div style="border-bottom:2px solid #22c8e5;padding-bottom:24px;margin-bottom:32px;">
    <h1 style="color:#22c8e5;font-size:24px;margin:0;letter-spacing:0.05em;">Message Received</h1>
    <p style="color:rgba(232,221,208,0.45);margin:8px 0 0;font-size:12px;letter-spacing:0.1em;">EVOBRAND · DALLAS, TEXAS</p>
  </div>
  <p style="font-size:17px;">Hello <strong>${name}</strong>,</p>
  <p style="color:rgba(232,221,208,0.8);line-height:1.7;">Thank you for reaching out. We've received your inquiry and a member of our team will be in touch within <strong style="color:#22c8e5;">1 business day</strong>.</p>
  <p style="color:rgba(232,221,208,0.8);line-height:1.7;">In the meantime, you're welcome to browse our work or book a free consultation directly on our website.</p>
  <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(34,200,229,0.2);">
    <p style="color:rgba(232,221,208,0.35);font-size:12px;letter-spacing:0.08em;margin:0;">EVOBRAND · Dallas, TX · info@evobrand.net · +1 214-531-4427</p>
  </div>
</div>`;
}

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
