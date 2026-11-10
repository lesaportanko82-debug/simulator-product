import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT = "simulator product";

type PlanKey = "month" | "lifetime";
const plans: Record<PlanKey, { amount: string }> = { month: { amount: "1000.00" }, lifetime: { amount: "2500.00" } };

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing env variable: ${name}`);
  return value;
}
function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const event = body.event;
    const webhookPayment = body.object;
    if (!webhookPayment?.id) return jsonResponse({ received: true, ignored: true, reason: "No payment id" });
    const paymentId = webhookPayment.id;

    const supabase = createClient(getRequiredEnv("SUPABASE_URL"), getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"));
    const shopId = getRequiredEnv("YOOKASSA_SHOP_ID_SIMULATOR");
    const secretKey = getRequiredEnv("YOOKASSA_SECRET_KEY_SIMULATOR");
    const auth = btoa(`${shopId}:${secretKey}`);

    // Статус всегда берём из API ЮKassa, а не из тела вебхука (тело может быть подделано).
    const verifyResponse = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
      method: "GET",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    });
    const payment = await verifyResponse.json();
    if (!verifyResponse.ok) {
      console.error("YooKassa verify error:", payment);
      return jsonResponse({ received: true, verified: false, reason: "YooKassa verification request failed" });
    }

    if (payment.status === "canceled") {
      await supabase.from("yookassa_payments").update({ status: "canceled", raw_payload: payment }).eq("yookassa_payment_id", paymentId);
      return jsonResponse({ received: true, status: "canceled" });
    }
    if (event !== "payment.succeeded" || payment.status !== "succeeded" || payment.paid !== true) {
      return jsonResponse({ received: true, ignored: true, event, payment_status: payment.status });
    }

    const metadata = payment.metadata || {};
    const userId = metadata.userId;
    const email = metadata.email || null;
    const plan = metadata.plan as PlanKey;
    if (!userId || !plan) throw new Error("Missing userId or plan in payment metadata");
    if (metadata.project !== PROJECT) return jsonResponse({ received: true, ignored: true, reason: "Payment project does not match" });
    const selectedPlan = plans[plan];
    if (!selectedPlan) throw new Error(`Unknown plan in metadata: ${plan}`);
    if (payment.amount?.value !== selectedPlan.amount) {
      throw new Error(`Payment amount mismatch. Expected ${selectedPlan.amount}, got ${payment.amount?.value}`);
    }

    // Идемпотентность: повторный вебхук по уже обработанному платежу не продлевает доступ ещё раз.
    const { data: existingPayment } = await supabase.from("yookassa_payments").select("status").eq("yookassa_payment_id", paymentId).maybeSingle();
    if (existingPayment?.status === "succeeded") return jsonResponse({ ok: true, already_processed: true });

    await supabase.from("yookassa_payments").upsert({
      user_id: userId, email, project: PROJECT, plan,
      amount: Number(selectedPlan.amount), currency: "RUB", status: "succeeded",
      yookassa_payment_id: paymentId, raw_payload: payment, paid_at: new Date().toISOString(),
    }, { onConflict: "yookassa_payment_id" });

    const { data: existingAccess, error: accessReadError } = await supabase
      .from("user_access").select("*").eq("user_id", userId).eq("project", PROJECT).maybeSingle();
    if (accessReadError) throw new Error(`Failed to read existing access: ${accessReadError.message}`);

    if (existingAccess?.status === "active" && existingAccess?.plan === "lifetime") {
      return jsonResponse({ ok: true, access: "already_lifetime" });
    }

    const now = new Date();
    let expiresAt: string | null = null;
    if (plan === "month") {
      let baseDate = now;
      if (existingAccess?.status === "active" && existingAccess?.expires_at && new Date(existingAccess.expires_at) > now) {
        baseDate = new Date(existingAccess.expires_at);
      }
      expiresAt = addDays(baseDate, 30).toISOString();
    }

    const { error: upsertAccessError } = await supabase.from("user_access").upsert({
      user_id: userId, email, project: PROJECT, plan, status: "active",
      starts_at: now.toISOString(), expires_at: expiresAt, updated_at: now.toISOString(),
    }, { onConflict: "user_id,project" });
    if (upsertAccessError) throw new Error(`Failed to update user_access: ${upsertAccessError.message}`);

    return jsonResponse({ ok: true, user_id: userId, plan, expires_at: expiresAt });
  } catch (error) {
    console.error("simulator-yookassa-webhook error:", error);
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }
});
