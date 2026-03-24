"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { defaultCourseProgress } from "./course-engine";
import {
  getStoredCertificateId,
  getNickname,
} from "./course-storage";
import {
  refreshStoredHeartsLocally,
  getStoredCourseProgress,
  saveStoredCourseProgress,
} from "./course-progress";
import {
  clearSupabaseBrowserSession,
  getSupabaseBrowserClient,
} from "./supabase-browser";
import {
  applyRemoteIdentityDefaults,
  courseProgressEquals,
  loadRemoteProgress,
  mapRealtimePayloadToRow,
  mergeCourseProgress,
  remoteRowToCourseProgress,
  syncProgressToSupabase,
} from "./remote-progress";
import {
  ensureProfileForUser,
  loadUserProfile,
  type UserProfileRow,
} from "./user-profiles";

type AuthContextValue = {
  loading: boolean;
  needsUsername: boolean;
  profile: UserProfileRow | null;
  refreshProfile: () => Promise<void>;
  session: Session | null;
  signInWithGoogle: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue>({
  loading: true,
  needsUsername: false,
  profile: null,
  refreshProfile: async () => undefined,
  session: null,
  signInWithGoogle: async () => undefined,
  signOut: async () => undefined,
  user: null,
});
const postAuthNextStorageKey = "stoked-post-auth-next";
const postAuthNextCookie = "stoked-post-auth-next";
const progressOwnerStorageKey = "stoked-progress-owner";

export function useAuth() {
  return useContext(AuthContext);
}

function normalizePostAuthPath(next?: string) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/course";
  }

  return next;
}

function getStoredProgressOwner() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(progressOwnerStorageKey);
}

function setStoredProgressOwner(owner: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(progressOwnerStorageKey, owner);
}

function waitFor<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((resolve, reject) => {
      window.setTimeout(() => {
        reject(new Error(`Timed out after ${timeoutMs}ms.`));
      }, timeoutMs);
    }),
  ]);
}

function isSupabaseLockInterruption(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message)
      : String(error);

  return (
    message.includes("another request stole it") ||
    message.includes("NavigatorLockAcquireTimeoutError") ||
    message.includes("LockManager")
  );
}

async function mergeRemoteProgressForUser(user: User) {
  const remoteRow = await loadRemoteProgress(user.id);
  const remoteProgress = remoteRowToCourseProgress(remoteRow);
  const localProgress = getStoredCourseProgress();
  const localProgressOwner = getStoredProgressOwner();
  const canMergeLocalProgress =
    !localProgressOwner || localProgressOwner === "guest" || localProgressOwner === user.id;
  const mergedProgress = canMergeLocalProgress
    ? mergeCourseProgress(localProgress, remoteProgress)
    : remoteProgress ?? defaultCourseProgress;

  applyRemoteIdentityDefaults(user, remoteRow);

  if (!courseProgressEquals(localProgress, mergedProgress)) {
    saveStoredCourseProgress(mergedProgress, { skipRemoteSync: true });
  }

  setStoredProgressOwner(user.id);

  if (!remoteProgress || !courseProgressEquals(remoteProgress, mergedProgress)) {
    await syncProgressToSupabase(
      user.id,
      mergedProgress,
      getNickname(),
      getStoredCertificateId() ?? undefined,
    );
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [didHydrateSession, setDidHydrateSession] = useState(false);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  async function hydrateProfile(nextUser: User | null) {
    if (!nextUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    try {
      const nextProfile = (await ensureProfileForUser(nextUser)) ?? (await loadUserProfile(nextUser.id));
      setProfile(nextProfile);
    } catch (error) {
      console.warn("Profile sync was skipped.", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data: { session: nextSession } }) => {
        if (!active) {
          return;
        }

        setSession(nextSession);

        if (nextSession?.user) {
          try {
            await mergeRemoteProgressForUser(nextSession.user);
            refreshStoredHeartsLocally(true);
          } catch (error) {
            if (!isSupabaseLockInterruption(error)) {
              console.warn("Remote progress sync was skipped during init.", error);
            }
          }
        }

        if (active) {
          await hydrateProfile(nextSession?.user ?? null);
        }

        setLoading(false);
        setDidHydrateSession(true);
      })
      .catch((error) => {
        console.error("Failed to load Supabase session", error);
        if (active) {
          setLoading(false);
          setDidHydrateSession(true);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) {
        return;
      }

      if (!didHydrateSession) {
        return;
      }

      setSession(nextSession);

      if (nextSession?.user) {
        try {
          await mergeRemoteProgressForUser(nextSession.user);
          refreshStoredHeartsLocally(true);
        } catch (error) {
          if (!isSupabaseLockInterruption(error)) {
            console.warn("Remote progress sync was skipped during auth change.", error);
          }
        }
      }

      await hydrateProfile(nextSession?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [didHydrateSession, supabase]);

  useEffect(() => {
    const currentUser = session?.user ?? null;

    if (!currentUser?.id) {
      return;
    }

    const channel = supabase
      .channel(`user-progress-sync-${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          filter: `user_id=eq.${currentUser.id}`,
          schema: "public",
          table: "user_progress",
        },
        (payload) => {
          const row = mapRealtimePayloadToRow(payload);
          const remoteProgress = remoteRowToCourseProgress(row);
          const localProgress = getStoredCourseProgress();

          applyRemoteIdentityDefaults(currentUser, row);

          if (remoteProgress) {
            const mergedProgress = mergeCourseProgress(localProgress, remoteProgress);

            if (!courseProgressEquals(localProgress, mergedProgress)) {
              saveStoredCourseProgress(mergedProgress, { skipRemoteSync: true });
            }
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user, supabase]);

  async function signInWithGoogle(next = "/course") {
    const safeNext = normalizePostAuthPath(next);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(postAuthNextStorageKey, safeNext);
      document.cookie = `${postAuthNextCookie}=${encodeURIComponent(safeNext)}; path=/; max-age=600; samesite=lax`;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function signOut() {
    if (session?.user) {
      setStoredProgressOwner(session.user.id);

      try {
        await waitFor(
          syncProgressToSupabase(session.user.id, getStoredCourseProgress()),
          1200,
        );
      } catch (error) {
        console.warn("Proceeding with logout after bounded progress sync attempt.", error);
      }
    }

    try {
      const result = await waitFor(
        supabase.auth.signOut({ scope: "local" }),
        2500,
      );

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      console.warn("Falling back to manual browser session cleanup during logout.", error);
    }

    clearSupabaseBrowserSession();
    setProfile(null);
    setSession(null);
  }

  const needsUsername = Boolean(session?.user && !profileLoading && !profile?.username);
  const value = useMemo(
    () => ({
      loading: loading || (Boolean(session?.user) && profileLoading),
      needsUsername,
      profile,
      refreshProfile: async () => {
        await hydrateProfile(session?.user ?? null);
      },
      session,
      signInWithGoogle,
      signOut,
      user: session?.user ?? null,
    }),
    [loading, needsUsername, profile, profileLoading, session],
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}
