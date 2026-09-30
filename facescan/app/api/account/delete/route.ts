import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Utilisateur non authentifié." },
      { status: 401 }
    );
  }

  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "Configuration serveur incomplète." },
      { status: 500 }
    );
  }

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );

  const userTables = [
    "otavio_daily_activity",
    "otavio_daily_tasks",
    "otavio_xp_events",
    "scans",
  ];

  for (const table of userTables) {
    const { error: tableDeleteError } = await admin
      .from(table)
      .delete()
      .eq("user_id", user.id);

    if (tableDeleteError) {
      return NextResponse.json(
        { error: `La suppression des données ${table} a échoué.` },
        { status: 500 }
      );
    }
  }

  const { error: profileDeleteError } = await admin
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileDeleteError) {
    return NextResponse.json(
      { error: "La suppression du profil a échoué." },
      { status: 500 }
    );
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);



  if (deleteError) {
    return NextResponse.json(
      { error: "La suppression du compte a échoué." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
