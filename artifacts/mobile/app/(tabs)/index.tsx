import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getMoodLabel, MoodOrb } from "@/components/MoodOrb";
import type { MoodLevel } from "@/context/MoodContext";
import { useMood } from "@/context/MoodContext";
import { useColors } from "@/hooks/useColors";

const MOODS: MoodLevel[] = [1, 2, 3, 4, 5];

export default function DropScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEntry, entries } = useMood();
  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState("");
  const [justDropped, setJustDropped] = useState(false);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleSelect = (level: MoodLevel) => {
    setSelected(level);
    Haptics.selectionAsync();
  };

  const handleDrop = async () => {
    if (!selected) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    btnScale.value = withSpring(0.9, { damping: 10 }, () => {
      btnScale.value = withSpring(1);
    });
    await addEntry(selected, note.trim());
    setSelected(null);
    setNote("");
    setJustDropped(true);
    setTimeout(() => setJustDropped(false), 2500);
  };

  const todayCount = entries.filter((e) => {
    const d = new Date(e.timestamp);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const topPad = Platform.OS === "web" ? 67 : insets.top + 16;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: topPad + 24,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            How are you feeling?
          </Text>
          {todayCount > 0 && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {todayCount} drop{todayCount !== 1 ? "s" : ""} today
            </Text>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.orbRow}>
          {MOODS.map((m) => (
            <View key={m} style={styles.orbWrap}>
              <MoodOrb
                level={m}
                selected={selected === m}
                onPress={() => handleSelect(m)}
                size={58}
              />
              <Text
                style={[
                  styles.orbLabel,
                  {
                    color: selected === m ? colors.foreground : colors.mutedForeground,
                    fontFamily:
                      selected === m ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {getMoodLabel(m)}
              </Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.noteWrap}>
          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="Add a note... (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={280}
            returnKeyType="done"
          />
          {note.length > 0 && (
            <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
              {280 - note.length}
            </Text>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Animated.View style={btnStyle}>
            <Pressable
              onPress={handleDrop}
              disabled={!selected}
              style={[
                styles.btn,
                {
                  backgroundColor: selected ? colors.primary : colors.muted,
                  opacity: selected ? 1 : 0.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: selected ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                Drop it
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {justDropped && (
          <Animated.View entering={FadeInDown.springify()} style={styles.feedback}>
            <Text style={[styles.feedbackText, { color: colors.success }]}>
              Mood dropped!
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    gap: 28,
  },
  header: {
    gap: 4,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  orbRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orbWrap: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  orbLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  noteWrap: {
    position: "relative",
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 90,
    textAlignVertical: "top",
  },
  charCount: {
    position: "absolute",
    bottom: 10,
    right: 12,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  btn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  feedback: {
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
