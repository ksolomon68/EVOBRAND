import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

Deno.serve(async (req) => {
  const { record, type, table } = await req.json();

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  try {
    let emailData;

    if (table === "tickets" && type === "INSERT") {
      // New Ticket Created by Client
      const { data: ticket } = await supabase
        .from("tickets")
        .select("*, client:client_id(email, full_name)")
        .eq("id", record.id)
        .single();

      emailData = {
        from: "EVOBRAND Support <info@evobrand.net>",
        to: ["info@evobrand.net"], // Admin notification
        subject: `[New Ticket] ${ticket.subject}`,
        html: `
          <h1>New Support Ticket</h1>
          <p><strong>From:</strong> ${ticket.client.full_name || ticket.client.email}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Priority:</strong> ${ticket.priority}</p>
          <p><a href="https://hllrpfnfusvaiwjknjge.supabase.co/dashboard/project/hllrpfnfusvaiwjknjge/editor">View in Dashboard</a></p>
        `,
      };
    } else if (table === "ticket_messages" && type === "INSERT") {
      // New Message
      const { data: message } = await supabase
        .from("ticket_messages")
        .select("*, ticket:ticket_id(*, client:client_id(email, full_name))")
        .eq("id", record.id)
        .single();

      if (message.sender_type === "Staff") {
        // Notify Client
        emailData = {
          from: "EVOBRAND Support <info@evobrand.net>",
          to: [message.ticket.client.email],
          subject: `[Update] Re: ${message.ticket.subject}`,
          html: `
            <h2>New reply from EVOBRAND Support</h2>
            <p>${message.message}</p>
            <hr />
            <p><a href="${Deno.env.get("SITE_URL")}/client-portal">View your ticket in the portal</a></p>
          `,
        };
      } else {
        // Notify Admin of Client reply
        emailData = {
          from: "EVOBRAND Support <info@evobrand.net>",
          to: ["info@evobrand.net"],
          subject: `[Client Reply] ${message.ticket.subject}`,
          html: `
            <h2>Client Reply</h2>
            <p><strong>From:</strong> ${message.ticket.client.full_name || message.ticket.client.email}</p>
            <p>${message.message}</p>
            <p><a href="https://hllrpfnfusvaiwjknjge.supabase.co/dashboard/project/hllrpfnfusvaiwjknjge/editor">View in Dashboard</a></p>
          `,
        };
      }
    }

    if (emailData) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailData),
      });

      const result = await res.json();
      return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ message: "No action taken" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
