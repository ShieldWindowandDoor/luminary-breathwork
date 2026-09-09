"use client";

import { useEffect, useRef } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAppContext, type StatsPayload } from "@/lib/store";

export default function CloudSync() {
  const ctx = useAppContext();
  const skipPush = useRef(false);
  const exportStats = ctx.exportStats;
  const importStats = ctx.importStats;

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const load = async (userId: string) => {
      const { data } = await supabase
        .from("user_stats")
        .select("payload")
        .eq("user_id", userId)
        .maybeSingle();
      if (data?.payload && Object.keys(data.payload as object).length > 0) {
        skipPush.current = true;
        importStats(data.payload as StatsPayload);
        window.setTimeout(() => {
          skipPush.current = false;
        }, 1000);
      } else {
        await supabase.from("user_stats").upsert({
          user_id: userId,
          payload: exportStats(),
          updated_at: new Date().toISOString(),
        });
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) load(data.user.id);
    });

    const { data } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (session?.user) load(session.user.id);
      }
    );
    return () => data.subscription.unsubscribe();
  }, [exportStats, importStats]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase || skipPush.current) return;
    const timer = window.setTimeout(async () => {
      if (skipPush.current) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await supabase.from("user_stats").upsert({
        user_id: data.user.id,
        payload: exportStats(),
        updated_at: new Date().toISOString(),
      });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [
    ctx.rhythmicSessions,
    ctx.holdRecords,
    ctx.holdSessions,
    ctx.boltScores,
    ctx.co2Scores,
    ctx.breathRateScores,
    ctx.practiceLog,
    ctx.journal,
    ctx.favorites,
    ctx.customProtocols,
    ctx.programProgress,
    ctx.settings,
    ctx.unlockedTrophies,
    ctx.weeklyChallengeClaimed,
    exportStats,
  ]);

  return null;
}
