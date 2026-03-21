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
import {
  getStoredCertificateId,
  getNickname,
} from "./course-storage";
import {
  refreshStoredHearts,
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

type AuthContextValue = {
  loading: boolean;
  session: Session | null;
  signInWithGoogle: (next?: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue>({
  loading: true,
  session: null,
  signInWithGoogle: async () => undefined,
  signOut: async () => undefined,
  user: null,
});

export function useAuth() {
  return useContext(AuthContext);
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

async function mergeRemoteProgressForUser(user: User) {
  const remoteRow = await loadRemoteProgress(user.id);
  const remoteProgress = remoteRowToCourseProgress(remoteRow);
  const localProgress = getStoredCourseProgress();
  const mergedProgress = mergeCourseProgress(localProgress, remoteProgress);

  applyRemoteIdentityDefaults(user, remoteRow);

  if (!courseProgressEquals(localProgress, mergedProgress)) {
    saveStoredCourseProgress(mergedProgress, { skipRemoteSync: true });
  }

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
            refreshStoredHearts(true);
          } catch (error) {
            console.error("Failed to sync remote progress on init", error);
          }
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load Supabase session", error);
        if (active) {
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);

      if (nextSession?.user) {
        try {
          await mergeRemoteProgressForUser(nextSession.user);
          refreshStoredHearts(true);
        } catch (error) {
          console.error("Failed to sync remote progress on auth change", error);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

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

          applyRemoteIdentityDefaults(currentUser, row);

          if (remoteProgress) {
            saveStoredCourseProgress(remoteProgress, { skipRemoteSync: true });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.user, supabase]);

  async function signInWithGoogle(next = "/course") {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "select_account",
        },
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  async function signOut() {
    if (session?.user) {
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
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        session,
        signInWithGoogle,
        signOut,
        user: session?.user ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
