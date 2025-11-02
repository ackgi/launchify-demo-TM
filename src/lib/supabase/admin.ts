// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!URL || !SERVICE_ROLE) {
  throw new Error("Missing Supabase env vars");
}

export const supabaseAdmin = createClient(URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});
