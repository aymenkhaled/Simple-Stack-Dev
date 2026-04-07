import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MoodBarChart } from "@/components/MoodBarChart";
import { getMoodColor, getMoodLabel } from "@/components/MoodOrb";
import { InsightCard } from "@/components/InsightCard";
import type { MoodEntry, MoodLevel } from "@/context/MoodContext";
import { useMood } from "@/context/MoodContext";
import { useColors } from "@/hooks/useColors";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function calcInsights(entries: MoodEntry[]) {
  if (entries.length === 0) return null;

  const avg =
    entries.reduce((s, e) => s + e.level, 0) / entries.length;

  const dayMap: Record<number, number[]> = {};
  for (const e of entries) {
    const d = new Date(e.timestamp).getDay();
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push(e.level);
  }

  let bestDay = -1;
  let bestAvg = -1;
  let worstDay = -1;
  let worstAvg = 10;
  for (const [day, levels] of Object.entries(dayMap)) {
    const a = levels.reduce((s, l) => s + l, 0) / levels.length;
    if (a > bestAvg) { bestAvg = a; bestDay = Number(day); }
    if (a < worstAvg) { worstAvg = a; worstDay = Number(day); }
  }

  const streak = calcStreak(entries);

  const last7 = entries.filter((e) => {
    const d = new Date(e.timestamp);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    return d >= cutoff;
  });

  const weeklyData: { day: string; avg: number | null }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayEntries = last7.filter((e) => {
      const t = new Date(e.timestamp);
      return t >= d && t < next;
    });
    weeklyData.push({
      day: DAYS[d.getDay()],
      avg:
        dayEntries.length > 0
          ? dayEntries.reduce((s, e) => s + e.level, 0) / dayEntries.length
          : null,
    });
  }

  return {
    avg,
    bestDay,
    bestAvg,
    worstDay,
    worstAvg,
    streak,
    total: entries.length,
    weeklyData,
  };
}

function calcStreak(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set<string>();
  for (const e of entries) {
    const d = new Date(e.timestamp);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  let streak = 0;
  const cur = new Date();
  while (true) {
    const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`;
    if (!days.has(key)) break;
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export default function InsightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, isLoading } = useMood();
  const topPad = Platform.OS === "web" ? 67 : 0;

  const insights = useMemo(() => calcInsights(entries), [entries]);

  if (isLoading) return null;

  if (!insights) {
    return (
      <View
        style={[
          styles.emptyWrap,
          { backgroundColor: colors.background, paddingTop: topPad + 40 },
        ]}
      >
        <Animated.View entering={FadeIn} style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No insights yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Log a few moods and your patterns will appear here.
          </Text>
        </Animated.View>
      </View>
    );
  }

  const avgLevel = Math.round(insights.avg) as MoodLevel;
  const avgColor = getMoodColor(avgLevel);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.scroll,
        {
          paddingTop: topPad + 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
        },
      ]}
    >
      <Animated.View entering={FadeInDown.delay(0).springify()} style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Last 7 days
        </Text>
        <MoodBarChart weeklyData={insights.weeklyData} />
      </Animated.View>

      <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 8 }]}>
        Your stats
      </Text>

      <InsightCard
        icon="happy-outline"
        label="Overall average"
        value={`${getMoodLabel(avgLevel)} (${insights.avg.toFixed(1)} / 5)`}
        color={avgColor}
        delay={100}
      />
      <InsightCard
        icon="flame-outline"
        label="Current streak"
        value={`${insights.streak} day${insights.streak !== 1 ? "s" : ""}`}
        color={colors.accent}
        delay={150}
      />
      <InsightCard
        icon="calendar-outline"
        label="Total drops"
        value={`${insights.total}`}
        color={colors.info}
        delay={200}
      />
      {insights.bestDay >= 0 && (
        <InsightCard
          icon="sunny-outline"
          label="Best day"
          value={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][insights.bestDay]} (avg ${insights.bestAvg.toFixed(1)})`}
          color={colors.success}
          delay={250}
        />
      )}
      {insights.worstDay >= 0 && insights.worstDay !== insights.bestDay && (
        <InsightCard
          icon="moon-outline"
          label="Hardest day"
          value={`${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][insights.worstDay]} (avg ${insights.worstAvg.toFixed(1)})`}
          color={colors.mood1}
          delay={300}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    gap: 0,
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  emptyWrap: {
    flex: 1,
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
