"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AuthPanel() {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );
    return () => data.subscription.unsubscribe();
  }, []);

  const oauth = async (provider: "google" | "facebook" | "apple" | "github") => {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
    setBusy(false);
  };

  const submitEmail = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setMessage(
        error
          ? error.message
          : "Check your email to confirm the account, then sign in."
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : "Signed in.");
    }
    setBusy(false);
  };

  const magic = async () => {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setMessage(error ? error.message : "Magic link sent. Check your email.");
    setBusy(false);
  };

  const signOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!configured) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xl font-light">Account</h3>
        <p>
          Stats are still saved on this device only. To enable Google, Facebook, email,
          and cloud backup, add your Supabase URL and publishable key as
          <code className="mx-1">NEXT_PUBLIC_SUPABASE_URL</code> and
          <code className="mx-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, then run
          <code className="mx-1">supabase/schema.sql</code> in the Supabase SQL editor.
          Turn on Google, Facebook, Apple, and email in Authentication → Providers.
        </p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-xl font-light">Signed in</h3>
        <p>{user.email || user.id}</p>
        <p>Practice stats now sync to your account when you are online.</p>
        <button
          onClick={signOut}
          className="w-full py-3 rounded-full bg-slate-800 font-bold"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
      <h3 className="text-xl font-light">Sign in</h3>
      <p>Save streaks, records, and journal across phones and computers.</p>
      <div className="grid grid-cols-2 gap-2">
        <button disabled={busy} onClick={() => oauth("google")} className="py-3 rounded-xl bg-slate-800 font-bold">
          Google
        </button>
        <button disabled={busy} onClick={() => oauth("facebook")} className="py-3 rounded-xl bg-slate-800 font-bold">
          Facebook
        </button>
        <button disabled={busy} onClick={() => oauth("apple")} className="py-3 rounded-xl bg-slate-800 font-bold">
          Apple
        </button>
        <button disabled={busy} onClick={() => oauth("github")} className="py-3 rounded-xl bg-slate-800 font-bold">
          GitHub
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 py-2 rounded-lg ${mode === "signin" ? "bg-indigo-600" : "bg-slate-800"}`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-lg ${mode === "signup" ? "bg-indigo-600" : "bg-slate-800"}`}
        >
          Create account
        </button>
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
      />
      <button
        disabled={busy || !email || !password}
        onClick={submitEmail}
        className="w-full py-3 rounded-full bg-indigo-600 font-bold disabled:opacity-40"
      >
        {mode === "signup" ? "Create account" : "Sign in with email"}
      </button>
      <button
        disabled={busy || !email}
        onClick={magic}
        className="w-full py-3 rounded-full bg-slate-800 font-bold disabled:opacity-40"
      >
        Email me a magic link
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
