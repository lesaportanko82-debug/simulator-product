import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT = "simulator product";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function hasActiveAccess(access: any) {
  if (!access || access.status !== "active") return false;
  if (access.plan === "lifetime") return true;
  return !!(access.expires_at && new Date(access.expires_at) > new Date());
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const user = await getAuthenticatedUser(req);
    const userId = user.id;
    const email = user.email || null;
    const supabase = createClient(getRequiredEnv("SUPABASE_URL"), getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"));

    const { data: existingAccess, error: readError } = await supabase
      .from("user_access").select("*").eq("user_id", userId).eq("project", PROJECT).maybeSingle();
    if (readError) throw new Error(`Failed to read user access: ${readError.message}`);

    if (hasActiveAccess(existingAccess)) {
      return jsonResponse({ ok: true, already_has_access: true, project: PROJECT, plan: existingAccess.plan, expires_at: existingAccess.expires_at });
    }
    if (existingAccess) {
      return jsonResponse({ ok: false, error: "Trial already used or previous access exists", project: PROJECT, current_plan: existingAccess.plan, current_status: existingAccess.status, expires_at: existingAccess.expires_at }, 409);
    }

    const now = new Date();
    const expiresAt = addDays(now, 7).toISOString();
    const { error: insertError } = await supabase.from("user_access").insert({
      user_id: userId, email, project: PROJECT, plan: "trial", status: "active",
      starts_at: now.toISOString(), expires_at: expiresAt, updated_at: now.toISOString(),
    });
    if (insertError) throw new Error(`Failed to create trial access: ${insertError.message}`);

    return jsonResponse({ ok: true, project: PROJECT, plan: "trial", starts_at: now.toISOString(), expires_at: expiresAt });
  } catch (error) {
    console.error("start-simulator-trial error:", error);
    return jsonResponse({ error: getErrorMessage(error) }, 500);
  }
});
