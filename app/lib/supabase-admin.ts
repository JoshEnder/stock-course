import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseDatabase = {
  public: {
    Tables: {
      waitlist_signups: {
        Row: {
          created_at: string;
          email: string;
          source: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          source?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          source?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let supabaseAdminClient: SupabaseClient<SupabaseDatabase> | null = null;

export function getSupabaseAdminClient() {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables.");
  }

  supabaseAdminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminClient;
}
