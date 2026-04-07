import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import type { MoodEntry } from "@/context/MoodContext";
import { useColors } from "@/hooks/useColors";
import { getMoodColor, getMoodLabel } from "./MoodOrb";
import type { MoodLevel } from "@/context/MoodContext";

function formatRelative(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

interface EntryCardProps {
  entry: MoodEntry;
  index: number;
  onDelete: (id: string) => void;
}

export function EntryCard({ entry, index, onDelete }: EntryCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const moodColor = getMoodColor(entry.level as MoodLevel);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLongPress = () => {
    Alert.alert("Delete entry?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(entry.id),
      },
    ]);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onLongPress={handleLongPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
      >
        <Animated.View
          style={[
            animStyle,
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderLeftColor: moodColor,
            },
          ]}
        >
          <View
            style={[styles.dot, { backgroundColor: moodColor }]}
          />
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.label, { color: moodColor }]}>
                {getMoodLabel(entry.level as MoodLevel)}
              </Text>
              <Text style={[styles.time, { color: colors.mutedForeground }]}>
                {formatRelative(entry.timestamp)} · {formatTime(entry.timestamp)}
              </Text>
            </View>
            {entry.note ? (
              <Text style={[styles.note, { color: colors.foreground }]} numberOfLines={2}>
                {entry.note}
              </Text>
            ) : null}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  note: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
