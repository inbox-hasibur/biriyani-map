"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// These env vars should be defined in your .env.local or Vercel project
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if both env vars are present; otherwise use mock
let supabaseInstance: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error("[UniMap] Failed to create Supabase client:", err);
  }
}

export const supabase = supabaseInstance;

// Admin email whitelist
export const ADMIN_EMAILS = ["admin@unimap.com"];

export function isAdmin(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
