import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseKey, getSupabaseUrl } from "@/lib/supabase/config";

export const createClient = () =>
  createBrowserClient(getSupabaseUrl(), getSupabaseKey());
