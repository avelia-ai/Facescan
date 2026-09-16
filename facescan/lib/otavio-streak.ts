import { createClient } from "@/lib/supabase/client";
import { OTAVIO_XP } from "@/lib/otavio-progression";
import { awardOtavioXp } from "@/lib/otavio-xp";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday() {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function getStreakBonus(streak: number) {
  if (streak === 30) return 200;
  if (streak === 14) return 100;
  if (streak === 7) return 50;
  if (streak === 3) return 25;
  return 0;
}

export async function registerOtavioDailyAction(actionType: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = getToday();
  const yesterday = getYesterday();

  const { data: todayActivity } = await supabase
    .from("otavio_daily_activity")
    .select("id, completed_actions")
    .eq("user_id", user.id)
    .eq("activity_date", today)
    .maybeSingle();

  const { data: yesterdayActivity } = await supabase
    .from("otavio_daily_activity")
    .select("id")
    .eq("user_id", user.id)
    .eq("activity_date", yesterday)
    .maybeSingle();

  if (!todayActivity) {
    await supabase.from("otavio_daily_activity").insert({
      user_id: user.id,
      activity_date: today,
      completed_actions: 1,
    });
  } else {
    await supabase
      .from("otavio_daily_activity")
      .update({
        completed_actions: todayActivity.completed_actions + 1,
      })
      .eq("id", todayActivity.id);
  }

  const currentActivityCount = todayActivity?.completed_actions ?? 0;

  const { data: profile } = await supabase
    .from("profiles")
    .select("otavio_streak")
    .eq("id", user.id)
    .maybeSingle();

  const currentStreak = profile?.otavio_streak ?? 0;

  // Une seule récompense de streak par journée
  if (currentActivityCount > 0) {
    return {
      streak: currentStreak,
      bonusXp: 0,
      actionXp: OTAVIO_XP.daily_action,
    };
  }

  const newStreak = yesterdayActivity
    ? currentStreak + 1
    : 1;

  await supabase
    .from("profiles")
    .update({
      otavio_streak: newStreak,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  const actionResult = await awardOtavioXp(
    `daily_action_${today}`,
    OTAVIO_XP.daily_action,
    {
      action_type: actionType,
      date: today,
      streak: newStreak,
    }
  );

  const bonusXp = getStreakBonus(newStreak);

  if (bonusXp > 0) {
    await awardOtavioXp(
      `streak_bonus_${newStreak}`,
      bonusXp,
      {
        streak: newStreak,
        date: today,
      }
    );
  }

  return {
    streak: newStreak,
    bonusXp,
    actionXp: actionResult?.xpEarned ?? OTAVIO_XP.daily_action,
  };
}
