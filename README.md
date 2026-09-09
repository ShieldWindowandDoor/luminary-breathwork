# Luminaries

A breathwork app with guided rhythmic breathing, holds, tests, and progress tracking.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) (http, not https).

## Accounts and cloud stats

Stats start on the device (browser storage). They are **not** in a database until you connect Supabase.

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the project URL and publishable key into `.env.local` (and Vercel env vars):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` still works if that is the name in your dashboard.

3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. In Authentication → Providers, enable Email, Google, Facebook, and optionally Apple and GitHub. Add the redirect URL:

```
https://YOUR_DOMAIN/auth/callback
http://127.0.0.1:3000/auth/callback
```

After that, sign-in syncs practice records to `user_stats`.
