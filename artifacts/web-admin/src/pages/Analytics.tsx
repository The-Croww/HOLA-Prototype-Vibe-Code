import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const WEEKLY_DATA = [
  { week: "W1", avg: 5.2 },
  { week: "W2", avg: 6.1 },
  { week: "W3", avg: 5.8 },
  { week: "W4", avg: 6.8 },
  { week: "W5", avg: 7.1 },
  { week: "W6", avg: 6.5 },
];

const ENGAGEMENT = [
  { feature: "Mood Log", uses: 124 },
  { feature: "AI Chat", uses: 89 },
  { feature: "Breathe", uses: 67 },
  { feature: "Journal", uses: 45 },
  { feature: "Meditate", uses: 38 },
];

export function Analytics() {
  const s: Record<string, React.CSSProperties> = {
    wrap: { padding: 32 },
    heading: { fontSize: 24, fontWeight: 600, marginBottom: 6 },
    sub: { fontSize: 14, color: "var(--muted)", marginBottom: 28 },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
    card: {
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 20,
    },
    cardTitle: { fontSize: 15, fontWeight: 600, marginBottom: 20 },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      marginBottom: 28,
    },
    statBox: {
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 18,
    },
    statVal: { fontSize: 28, fontWeight: 600, marginBottom: 4 },
    statLabel: { fontSize: 13, color: "var(--muted)" },
  };

  return (
    <div style={s.wrap}>
      <div style={s.heading}>Analytics</div>
      <div style={s.sub}>Practice-wide wellness insights</div>
      <div style={s.statsRow}>
        {[
          { label: "Total clients", value: "5", emoji: "👥" },
          { label: "Avg mood this week", value: "6.5", emoji: "📊" },
          { label: "Check-ins this week", value: "23", emoji: "✅" },
          { label: "Active streak avg", value: "4.2d", emoji: "🔥" },
        ].map((s2) => (
          <div key={s2.label} style={s.statBox}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s2.emoji}</div>
            <div style={s.statVal}>{s2.value}</div>
            <div style={s.statLabel}>{s2.label}</div>
          </div>
        ))}
      </div>
      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardTitle}>Avg mood trend (6 weeks)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
              />
              <YAxis
                domain={[1, 10]}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
              />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#3dd68c"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3dd68c" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>Feature engagement</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ENGAGEMENT}>
              <XAxis
                dataKey="feature"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="uses" fill="#0a0a0a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
