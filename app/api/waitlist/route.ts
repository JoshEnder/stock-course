import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/app/lib/supabase-admin";
import {
  getWaitlistEmailError,
  normalizeWaitlistEmail,
} from "@/app/lib/waitlist";

export const runtime = "nodejs";

type WaitlistRequestBody = {
  email?: unknown;
  company?: unknown;
};

function createMessageResponse(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | WaitlistRequestBody
    | null;

  if (!body || typeof body !== "object") {
    return createMessageResponse("Please enter a valid email address.", 400);
  }

  const { email, company } = body;

  if (typeof company === "string" && company.trim().length > 0) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  if (typeof email !== "string") {
    return createMessageResponse("Please enter a valid email address.", 400);
  }

  const emailError = getWaitlistEmailError(email);

  if (emailError) {
    return createMessageResponse(emailError, 400);
  }

  const normalizedEmail = normalizeWaitlistEmail(email);

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("waitlist_signups").upsert(
      {
        email: normalizedEmail,
        source: "stoked_waitlist",
      },
      {
        onConflict: "email",
      },
    );

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Waitlist submission failed", error);

    if (
      error instanceof Error &&
      error.message === "Missing Supabase admin environment variables."
    ) {
      return createMessageResponse(
        "The waitlist is temporarily unavailable. Please try again soon.",
        503,
      );
    }

    return createMessageResponse(
      "We couldn't join the waitlist right now. Please try again in a moment.",
      500,
    );
  }
}
