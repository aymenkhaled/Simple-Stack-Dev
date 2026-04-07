import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { getMoodColor } from "./MoodOrb";
import type { MoodLevel } from "@/context/MoodContext";

interface BarProps {
  day: string;
  avg: number | null;
  index: number;
}

function Bar({ day, avg, index }: BarProps) {
  const colors = useColors();
  const height = useSharedValue(0);

  const MAX_BAR_HEIGHT = 80;
  const targetHeight = avg !== null ? (avg / 5) * MAX_BAR_HEIGHT : 0;

  React.useEffect(() => {
    height.value = withDelay(index * 50, withTiming(targetHeight, { duration: 500 }));
  }, [avg]);

  const animStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const barColor = avg !== null ? getMoodColor(Math.round(avg) as MoodLevel) : colors.border;

  return (
    <View style={styles.barWrap}>
      <View style={[styles.barBg, { height: MAX_BAR_HEIGHT }]}>
        <Animated.View
          style={[
            animStyle,
            styles.bar,
            { backgroundColor: barColor },
          ]}
        />
      </View>
      <Text style={[styles.dayLabel, { color: colors.mutedForeground }]}>{day}</Text>
    </View>
  );
}

interface MoodBarChartProps {
  weeklyData: { day: string; avg: number | null }[];
}

export function MoodBarChart({ weeklyData }: MoodBarChartProps) {
  return (
    <View style={styles.chart}>
      {weeklyData.map((d, i) => (
        <Bar key={d.day} day={d.day} avg={d.avg} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingVertical: 8,
    gap: 4,
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barBg: {
    width: "100%",
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
