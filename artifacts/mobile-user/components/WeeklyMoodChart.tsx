import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

interface DataPoint {
  day: string;
  score: number | null;
}

interface WeeklyMoodChartProps {
  data: DataPoint[];
}

export function WeeklyMoodChart({ data }: WeeklyMoodChartProps) {
  const colors = useColors();
  const maxScore = 10;

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {data.map((point, index) => {
          const hasData = point.score !== null;
          const fillRatio = hasData ? (point.score ?? 0) / maxScore : 0;
          const barColor = hasData
            ? point.score! >= 7
              ? colors.calm
              : point.score! >= 4
                ? colors.warning
                : colors.alert
            : colors.border;

          return (
            <View key={index} style={styles.barWrapper}>
              <View
                style={[
                  styles.barBg,
                  { backgroundColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${fillRatio * 100}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              {hasData && (
                <Text
                  style={[styles.scoreLabel, { color: colors.mutedForeground }]}
                >
                  {point.score}
                </Text>
              )}
              <Text
                style={[styles.dayLabel, { color: colors.mutedForeground }]}
              >
                {point.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 100,
    gap: 6,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  barBg: {
    width: "100%",
    height: 72,
    borderRadius: 6,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
});
