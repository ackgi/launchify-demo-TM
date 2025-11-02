// src/app/api/sync-profile/route.ts
import { auth } from "@clerk/nextjs/server";
import { createClerkClient } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";
    const displayName =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName ?? email.split("@")[0];
    const avatarUrl = user.imageUrl ?? null;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          clerk_user_id: user.id,
          email,
          display_name: displayName,
          avatar_url: avatarUrl,
        },
        { onConflict: "clerk_user_id" }
      );

    if (error) throw error;
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("sync-profile error:", err);
    return new Response("Sync failed", { status: 500 });
  }
}
