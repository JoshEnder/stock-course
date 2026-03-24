"use client";

import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase-browser";

export type UserProfileRow = {
  user_id: string;
  username: string | null;
  username_normalized: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const reservedUsernames = new Set([
  "admin",
  "administrator",
  "api",
  "app",
  "auth",
  "billing",
  "contact",
  "help",
  "leaderboard",
  "login",
  "logout",
  "me",
  "mod",
  "moderator",
  "onboarding",
  "privacy",
  "profile",
  "root",
  "settings",
  "signup",
  "stoked",
  "support",
  "system",
  "team",
]);

const usernamePattern = /^[A-Za-z0-9_.]{3,20}$/;

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function validateUsername(value: string) {
  const normalized = normalizeUsername(value);

  if (!normalized) {
    return {
      normalized,
      valid: false,
      error: "Choose a username to continue.",
    };
  }

  if (normalized.length < 3) {
    return {
      normalized,
      valid: false,
      error: "Username must be at least 3 characters.",
    };
  }

  if (normalized.length > 20) {
    return {
      normalized,
      valid: false,
      error: "Username must be 20 characters or fewer.",
    };
  }

  if (!usernamePattern.test(normalized)) {
    return {
      normalized,
      valid: false,
      error: "Use letters, numbers, underscores, or periods only.",
    };
  }

  if (reservedUsernames.has(normalized)) {
    return {
      normalized,
      valid: false,
      error: "That username is reserved.",
    };
  }

  return {
    normalized,
    valid: true,
    error: null,
  };
}

function isDuplicateUsernameError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message)
        : String(error);

  return (
    message.includes("profiles_username_normalized_unique_idx") ||
    message.includes("duplicate key") ||
    message.includes("23505")
  );
}

export async function loadUserProfile(userId: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, username, username_normalized, created_at, updated_at")
    .eq("user_id", userId)
    .maybeSingle<UserProfileRow>();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function ensureProfileForUser(user: User) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }

  return loadUserProfile(user.id);
}

export async function checkUsernameAvailability(username: string, currentUserId?: string) {
  const validation = validateUsername(username);

  if (!validation.valid) {
    return {
      available: false,
      error: validation.error,
      normalized: validation.normalized,
    };
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username_normalized", validation.normalized)
    .maybeSingle<{ user_id: string }>();

  if (error) {
    throw error;
  }

  if (!data || data.user_id === currentUserId) {
    return {
      available: true,
      error: null,
      normalized: validation.normalized,
    };
  }

  return {
    available: false,
    error: "That username is already taken.",
    normalized: validation.normalized,
  };
}

export async function saveUsernameForCurrentUser(username: string) {
  const validation = validateUsername(username);

  if (!validation.valid) {
    throw new Error(validation.error ?? "Choose a valid username.");
  }

  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("You need to be signed in before setting a username.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: session.user.id,
        username: validation.normalized,
        username_normalized: validation.normalized,
      },
      { onConflict: "user_id" },
    )
    .select("user_id, username, username_normalized, created_at, updated_at")
    .single<UserProfileRow>();

  if (error) {
    if (isDuplicateUsernameError(error)) {
      throw new Error("That username is already taken.");
    }

    throw error;
  }

  return data;
}
