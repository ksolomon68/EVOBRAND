import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
  const { record, old_record, type, table } = await req.json();

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  try {
    const emailsToSend: any[] = [];
    const pushEmail = (to: string[], subject: string, html: string) => {
      emailsToSend.push({
        from: "EVOBRAND Support <no-reply@evobrand.net>",
        to,
        subject,
        html,
      });
    };

    if (table === "tickets") {
      const { data: ticket } = await supabase
        .from("tickets")
        .select("*, client:client_id(email, full_name)")
        .eq("id", record.id)
        .single();

      const clientEmail = ticket?.client?.email;
      const clientName = ticket?.client?.full_name || clientEmail || "Client";

      if (type === "INSERT") {
        // 1. Internal Admin Notification
        pushEmail(
          ["info@evobrand.net"],
          `[New Ticket] ${ticket.subject}`,
          `
            <h1>New Support Ticket</h1>
            <p><strong>From:</strong> ${clientName}</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            <p><strong>Priority:</strong> ${ticket.priority}</p>
            <p><a href="https://hllrpfnfusvaiwjknjge.supabase.co/dashboard/project/hllrpfnfusvaiwjknjge/editor">View in Dashboard</a></p>
          `
        );

        // 2. Client Receipt
        if (clientEmail) {
          pushEmail(
            [clientEmail],
            `Ticket Received: ${ticket.subject}`,
            `
              <h2>We've received your request!</h2>
              <p>Hi ${clientName},</p>
              <p>This is to confirm that we have received your support ticket regarding <strong>"${ticket.subject}"</strong>.</p>
              <p>Our team will review this shortly. You can track updates in your <a href="${Deno.env.get("SITE_URL")}/client-portal">Client Portal</a>.</p>
            `
          );
        }
      } else if (type === "UPDATE" && old_record && old_record.status !== record.status) {
        // Ticket Status Updated
        if (clientEmail) {
          pushEmail(
            [clientEmail],
            `[Status Update] ${ticket.subject}`,
            `
              <h2>Ticket Status Changed</h2>
              <p>Hi ${clientName},</p>
              <p>The status of your ticket <strong>"${ticket.subject}"</strong> has been updated.</p>
              <p><strong>New Status:</strong> ${record.status}</p>
              <p>Please check your <a href="${Deno.env.get("SITE_URL")}/client-portal">Client Portal</a> for more details.</p>
            `
          );
        }
      }
    } else if (table === "ticket_messages" && type === "INSERT") {
      // New Message
      const { data: message } = await supabase
        .from("ticket_messages")
        .select("*, ticket:ticket_id(*, client:client_id(email, full_name))")
        .eq("id", record.id)
        .single();

      const clientEmail = message?.ticket?.client?.email;
      const clientName = message?.ticket?.client?.full_name || clientEmail;

      if (message.sender_type === "Staff" && clientEmail) {
        // Notify Client
        pushEmail(
          [clientEmail],
          `[Update] Re: ${message.ticket.subject}`,
          `
            <h2>New reply from EVOBRAND Support</h2>
            <p>${message.message}</p>
            <hr />
            <p><a href="${Deno.env.get("SITE_URL")}/client-portal">View your ticket in the portal</a></p>
          `
        );
      } else if (message.sender_type === "Client") {
        // Notify Admin of Client reply
        pushEmail(
          ["info@evobrand.net"],
          `[Client Reply] ${message.ticket?.subject}`,
          `
            <h2>Client Reply</h2>
            <p><strong>From:</strong> ${clientName}</p>
            <p>${message.message}</p>
            <p><a href="https://hllrpfnfusvaiwjknjge.supabase.co/dashboard/project/hllrpfnfusvaiwjknjge/editor">View in Dashboard</a></p>
          `
        );
      }
    }

    if (emailsToSend.length > 0) {
      const results = [];
      for (const emailData of emailsToSend) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(emailData),
        });

        const data = await res.json();
        if (!res.ok) {
          console.error("[Resend Error]:", data, "Email payload:", emailData);
        } else {
          console.log(`Email successfully sent to ${emailData.to.join(", ")}`);
        }
        results.push(data);
      }
      return new Response(JSON.stringify({ sent: results }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ message: "No action taken" }), { status: 200 });
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
