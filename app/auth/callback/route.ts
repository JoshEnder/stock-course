import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const postAuthNextCookie = "stoked-post-auth-next";

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

function isMissingUserProgressTable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("public.user_progress") || message.includes("PGRST205");
}

function normalizePostAuthPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/course";
  }

  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const cookieStore = await cookies();
  const cookieNext = cookieStore.get(postAuthNextCookie)?.value ?? null;
  const safeNext = normalizePostAuthPath(next ?? cookieNext);
  const redirectResponse = NextResponse.redirect(new URL(safeNext, requestUrl.origin));
  const errorResponse = (message: string) =>
    NextResponse.redirect(
      new URL(`/onboarding?auth_error=${encodeURIComponent(message)}`, requestUrl.origin),
    );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return errorResponse("Supabase environment variables are missing.");
  }

  if (!code) {
    return redirectResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, options, value }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return errorResponse(error.message);
  }

  const user = data.user;

  if (user) {
    const googleName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name.trim().split(" ")[0]
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name.trim().split(" ")[0]
          : "Learner";

    const { error: progressError } = await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        nickname: googleName || "Learner",
        last_login_at: new Date().toISOString(),
        last_login_ip: getClientIp(request),
      },
      { onConflict: "user_id" },
    );

    if (progressError && !isMissingUserProgressTable(progressError)) {
      console.error("Failed to store login IP metadata", progressError);
    }
  }

  redirectResponse.cookies.set(postAuthNextCookie, "", {
    expires: new Date(0),
    path: "/",
  });

  return redirectResponse;
}
