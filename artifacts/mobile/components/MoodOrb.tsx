import React, { useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { MoodLevel } from "@/context/MoodContext";
import { useColors } from "@/hooks/useColors";

const MOOD_COLORS: Record<MoodLevel, string[]> = {
  1: ["#ef4444", "#dc2626"],
  2: ["#f97316", "#ea580c"],
  3: ["#eab308", "#ca8a04"],
  4: ["#22c55e", "#16a34a"],
  5: ["#06b6d4", "#0891b2"],
};

interface MoodOrbProps {
  level: MoodLevel;
  selected?: boolean;
  onPress?: () => void;
  size?: number;
}

function OrbInner({
  level,
  selected,
  size,
}: {
  level: MoodLevel;
  selected: boolean;
  size: number;
}) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    if (selected) {
      scale.value = withSpring(1.12, { damping: 10, stiffness: 150 });
      glow.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      glow.value = withTiming(0, { duration: 200 });
    }
  }, [selected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value * 0.6,
    shadowRadius: glow.value * 20,
  }));

  const [color1, color2] = MOOD_COLORS[level];

  return (
    <Animated.View
      style={[
        animStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color1,
          shadowColor: color1,
          shadowOffset: { width: 0, height: 0 },
          elevation: selected ? 12 : 0,
          borderWidth: selected ? 3 : 0,
          borderColor: color2,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: (size * 0.5) / 2,
          backgroundColor: "rgba(255,255,255,0.25)",
          position: "absolute",
          top: size * 0.1,
          left: size * 0.15,
        }}
      />
    </Animated.View>
  );
}

export function MoodOrb({ level, selected = false, onPress, size = 56 }: MoodOrbProps) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        <OrbInner level={level} selected={selected} size={size} />
      </Pressable>
    );
  }
  return <OrbInner level={level} selected={selected} size={size} />;
}

export function getMoodColor(level: MoodLevel): string {
  return MOOD_COLORS[level][0];
}

export function getMoodLabel(level: MoodLevel): string {
  const labels: Record<MoodLevel, string> = {
    1: "Rough",
    2: "Low",
    3: "Okay",
    4: "Good",
    5: "Great",
  };
  return labels[level];
}
