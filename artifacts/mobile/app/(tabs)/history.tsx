import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EntryCard } from "@/components/EntryCard";
import { useMood } from "@/context/MoodContext";
import { useColors } from "@/hooks/useColors";

function groupByDate(entries: ReturnType<typeof useMood>["entries"]) {
  const groups: { title: string; data: typeof entries }[] = [];
  const map = new Map<string, typeof entries>();

  for (const e of entries) {
    const d = new Date(e.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    ) {
      key = "Today";
    } else if (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    ) {
      key = "Yesterday";
    } else {
      key = d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }

  map.forEach((data, title) => groups.push({ title, data }));
  return groups;
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { entries, deleteEntry, isLoading } = useMood();

  const topPad = Platform.OS === "web" ? 67 : 0;
  const groups = groupByDate(entries);

  type FlatItem =
    | { kind: "header"; key: string; title: string }
    | { kind: "entry"; key: string; entry: typeof entries[0]; index: number };

  const flatData: FlatItem[] = [];
  let globalIndex = 0;
  for (const g of groups) {
    flatData.push({ kind: "header", key: `h-${g.title}`, title: g.title });
    for (const e of g.data) {
      flatData.push({ kind: "entry", key: e.id, entry: e, index: globalIndex++ });
    }
  }

  if (isLoading) return null;

  return (
    <FlatList
      data={flatData}
      keyExtractor={(item) => item.key}
      contentContainerStyle={[
        styles.list,
        {
          paddingTop: topPad + 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
          backgroundColor: colors.background,
        },
      ]}
      style={{ backgroundColor: colors.background }}
      ListEmptyComponent={() => (
        <Animated.View entering={FadeIn} style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No drops yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Head to the Drop tab and log your first mood.
          </Text>
        </Animated.View>
      )}
      renderItem={({ item }) => {
        if (item.kind === "header") {
          return (
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              {item.title}
            </Text>
          );
        }
        return (
          <EntryCard
            entry={item.entry}
            index={item.index}
            onDelete={deleteEntry}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
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
    paddingHorizontal: 40,
  },
});
