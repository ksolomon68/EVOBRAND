import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
    const MAILCHIMP_AUDIENCE_ID = Deno.env.get("MAILCHIMP_AUDIENCE_ID");
    
    // The datacenter is the suffix of the API key (e.g., us20)
    const DATACENTER = MAILCHIMP_API_KEY?.split("-")[1] || "us20";

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
      throw new Error("Mailchimp configuration missing in environment variables");
    }

    const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Mailchimp error handling
      if (result.title === "Member Exists") {
        return new Response(JSON.stringify({ message: "You are already subscribed!" }), {
          status: 200, // Treat as success or handled case
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(result.detail || result.title || "Failed to subscribe to Mailchimp");
    }

    return new Response(JSON.stringify({ message: "Successfully subscribed!" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
