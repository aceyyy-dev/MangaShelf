import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RevenueCatEvent {
  event: {
    type: string;
    app_user_id: string;
    product_id?: string;
    period_type?: string;
    purchased_at_ms?: number;
    expiration_at_ms?: number;
    is_trial_conversion?: boolean;
    cancellation_at_ms?: number;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData: RevenueCatEvent = await req.json();
    const { event } = webhookData;

    console.log("Received RevenueCat webhook:", event.type);

    const userId = event.app_user_id;

    let subscriptionStatus = "free";
    let subscriptionTier = null;
    let expiresAt = null;

    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "UNCANCELLATION":
        subscriptionStatus = "premium";
        subscriptionTier = event.product_id?.includes("monthly") ? "monthly" : "yearly";
        expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null;
        console.log(`User ${userId} subscribed/renewed: ${subscriptionTier}`);
        break;

      case "CANCELLATION":
        if (event.expiration_at_ms && event.expiration_at_ms > Date.now()) {
          subscriptionStatus = "premium";
          subscriptionTier = event.product_id?.includes("monthly") ? "monthly" : "yearly";
          expiresAt = new Date(event.expiration_at_ms).toISOString();
        } else {
          subscriptionStatus = "expired";
          subscriptionTier = null;
          expiresAt = null;
        }
        console.log(`User ${userId} cancelled subscription`);
        break;

      case "EXPIRATION":
      case "BILLING_ISSUE":
        subscriptionStatus = "expired";
        subscriptionTier = null;
        expiresAt = null;
        console.log(`User ${userId} subscription expired`);
        break;

      case "PRODUCT_CHANGE":
        subscriptionStatus = "premium";
        subscriptionTier = event.product_id?.includes("monthly") ? "monthly" : "yearly";
        expiresAt = event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null;
        console.log(`User ${userId} changed subscription: ${subscriptionTier}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return new Response(
          JSON.stringify({ received: true, message: "Event type not handled" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: subscriptionStatus,
        subscription_tier: subscriptionTier,
        subscription_expires_at: expiresAt,
        revenuecat_customer_id: userId,
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    console.log(`Successfully updated user ${userId} subscription status to ${subscriptionStatus}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        status: subscriptionStatus,
        tier: subscriptionTier
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
