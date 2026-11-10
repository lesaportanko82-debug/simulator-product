import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT = "simulator product";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type PlanKey = "month" | "lifetime";

const plans: Record<PlanKey, { amount: string; description: string }> = {
  month: { amount: "1000.00", description: "Simulator Product: месячная подписка на 30 дней" },
  lifetime: { amount: "2500.00", description: "Simulator Product: вечный доступ" },
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env variable: ${name}`);
  return value;
}

async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) throw new Error("Missing Authorization header");
  const token = authHeader.replace("Bearer ", "");
  const authClient = createClient(getRequiredEnv("SUPABASE_URL"), getRequiredEnv("SUPABASE_ANON_KEY"));
  const { data: { user }, error } = await authClient.auth.getUser(token);
  if (error || !user) throw new Error("User is not authenticated");
  return user;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));
    const plan = body.plan as PlanKey;
    const selectedPlan = plans[plan];
    if (!selectedPlan) return jsonResponse({ error: "Unknown plan", allowedPlans: Object.keys(plans) }, 400);

    const userId = user.id;
    const email = user.email || body.email || null;
    const shopId = getRequiredEnv("YOOKASSA_SHOP_ID_SIMULATOR");
    const secretKey = getRequiredEnv("YOOKASSA_SECRET_KEY_SIMULATOR");
    const siteUrl = getRequiredEnv("SITE_URL_SIMULATOR").replace(/\/$/, "");
    const auth = btoa(`${shopId}:${secretKey}`);

    const paymentResponse = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Idempotence-Key": crypto.randomUUID(), "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: { value: selectedPlan.amount, currency: "RUB" },
        capture: true,
        confirmation: { type: "redirect", return_url: `${siteUrl}/payment-success` },
        description: selectedPlan.description,
        metadata: { userId, email, plan, project: PROJECT },
      }),
    });
    const payment = await paymentResponse.json();
    if (!paymentResponse.ok) {
      console.error("YooKassa payment creation error:", payment);
      return jsonResponse({ error: "YooKassa payment creation failed", details: payment }, 400);
    }

    const supabase = createClient(getRequiredEnv("SUPABASE_URL"), getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const { error: insertError } = await supabase.from("yookassa_payments").insert({
      user_id: userId, email, project: PROJECT, plan,
      amount: Number(selectedPlan.amount), currency: "RUB", status: payment.status,
      yookassa_payment_id: payment.id,
      confirmation_url: payment.confirmation?.confirmation_url || null,
      raw_payload: payment,
    });
    if (insertError) {
      console.error("Payment DB insert error:", insertError);
      return jsonResponse({ error: "Payment was created in YooKassa, but failed to save in DB", details: insertError.message }, 500);
    }

    return jsonResponse({ ok: true, payment_id: payment.id, confirmation_url: payment.confirmation?.confirmation_url });
  } catch (error) {
    console.error("create-simulator-yookassa-payment error:", error);
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }
});
