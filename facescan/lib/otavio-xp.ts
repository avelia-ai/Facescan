import { createClient } from "@/lib/supabase/client";
import { getOtavioStage, OTAVIO_XP } from "@/lib/otavio-progression";

export async function awardOtavioXp(
  eventType: string,
  xp: number,
  metadata: Record<string, unknown> = {}
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: existingEvent } = await supabase
    .from("otavio_xp_events")
    .select("id")
    .eq("user_id", user.id)
    .eq("event_type", eventType)
    .limit(1)
    .maybeSingle();

  if (existingEvent) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("otavio_xp")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  const currentXp = profile?.otavio_xp ?? 0;
  const newXp = currentXp + xp;
  const stage = getOtavioStage(newXp);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      otavio_xp: newXp,
      otavio_stage: stage.stage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    throw updateError;
  }

  const { error: eventError } = await supabase
    .from("otavio_xp_events")
    .insert({
      user_id: user.id,
      event_type: eventType,
      xp,
      metadata: {
        ...metadata,
        new_total_xp: newXp,
        stage: stage.stage,
        stage_name: stage.name,
      },
    });

  if (eventError) {
    throw eventError;
  }

  return {
    xpEarned: xp,
    totalXp: newXp,
    stage: stage.stage,
    stageName: stage.name,
  };
}

export const OTAVIO_EVENTS = {
  firstScan: () =>
    awardOtavioXp(
      "first_scan",
      OTAVIO_XP.first_scan
    ),

  newScan: (scanId: string) =>
    awardOtavioXp(
      `scan_${scanId}`,
      OTAVIO_XP.new_scan,
      { scan_id: scanId }
    ),

  dailyAction: (date: string) =>
    awardOtavioXp(
      `daily_action_${date}`,
      OTAVIO_XP.daily_action,
      { date }
    ),

  routineCompleted: (date: string) =>
    awardOtavioXp(
      `routine_${date}`,
      OTAVIO_XP.routine_completed,
      { date }
    ),

  adviceFollowed: (adviceId: string) =>
    awardOtavioXp(
      `advice_${adviceId}`,
      OTAVIO_XP.advice_followed,
      { advice_id: adviceId }
    ),

  positiveProgress: (scanId: string) =>
    awardOtavioXp(
      `positive_progress_${scanId}`,
      OTAVIO_XP.positive_progress,
      { scan_id: scanId }
    ),
};
