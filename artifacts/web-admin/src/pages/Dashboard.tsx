import React, { useState } from "react";
import {
  Search,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
} from "lucide-react";

const MOCK_CLIENTS = [
  {
    id: "1",
    name: "Maria Santos",
    email: "maria@email.com",
    lastCheckin: "Today",
    avgMood: 7.2,
    trend: "up",
    risk: "low",
    streak: 5,
    emotions: ["Calm", "Hopeful"],
  },
  {
    id: "2",
    name: "Juan dela Cruz",
    email: "juan@email.com",
    lastCheckin: "Yesterday",
    avgMood: 4.1,
    trend: "down",
    risk: "medium",
    streak: 2,
    emotions: ["Anxious", "Tired"],
  },
  {
    id: "3",
    name: "Ana Reyes",
    email: "ana@email.com",
    lastCheckin: "3 days ago",
    avgMood: 2.8,
    trend: "down",
    risk: "high",
    streak: 0,
    emotions: ["Sad", "Overwhelmed"],
  },
  {
    id: "4",
    name: "Carlo Mendoza",
    email: "carlo@email.com",
    lastCheckin: "Today",
    avgMood: 8.5,
    trend: "up",
    risk: "low",
    streak: 12,
    emotions: ["Happy", "Energized"],
  },
  {
    id: "5",
    name: "Sofia Lim",
    email: "sofia@email.com",
    lastCheckin: "2 days ago",
    avgMood: 5.5,
    trend: "neutral",
    risk: "low",
    streak: 3,
    emotions: ["Neutral", "Calm"],
  },
];

const RISK_COLORS: Record<string, string> = {
  low: "#3dd68c",
  medium: "#ffb547",
  high: "#ff6b6b",
};

export function Dashboard({
  onViewClient,
}: {
  onViewClient: (id: string, name: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalAlerts = MOCK_CLIENTS.filter((c) => c.risk === "high").length;
  const avgMood = (
    MOCK_CLIENTS.reduce((s, c) => s + c.avgMood, 0) / MOCK_CLIENTS.length
  ).toFixed(1);

  const s: Record<string, React.CSSProperties> = {
    wrap: { padding: 32 },
    heading: { fontSize: 24, fontWeight: 600, marginBottom: 6 },
    sub: { fontSize: 14, color: "var(--muted)", marginBottom: 28 },
    statsRow: { display: "flex", gap: 16, marginBottom: 28 },
    stat: {
      flex: 1,
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 20,
    },
    statVal: { fontSize: 28, fontWeight: 600, marginBottom: 4 },
    statLabel: { fontSize: 13, color: "var(--muted)" },
    toolbar: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    searchWrap: { flex: 1, position: "relative" as const },
    searchInput: {
      width: "100%",
      padding: "9px 14px 9px 36px",
      borderRadius: 8,
      border: "1px solid var(--border)",
      fontSize: 14,
      fontFamily: "Inter, sans-serif",
      outline: "none",
    },
    searchIcon: {
      position: "absolute" as const,
      left: 11,
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--muted)",
    },
    addBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "9px 16px",
      borderRadius: 8,
      background: "#0a0a0a",
      color: "#fff",
      border: "none",
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "Inter, sans-serif",
    },
    table: { width: "100%", borderCollapse: "collapse" as const },
    th: {
      textAlign: "left" as const,
      fontSize: 12,
      fontWeight: 500,
      color: "var(--muted)",
      padding: "10px 16px",
      borderBottom: "1px solid var(--border)",
      textTransform: "uppercase" as const,
      letterSpacing: "0.04em",
    },
    td: {
      padding: "14px 16px",
      borderBottom: "1px solid var(--border)",
      fontSize: 14,
    },
    riskBadge: (risk: string): React.CSSProperties => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      background: RISK_COLORS[risk] + "22",
      color: RISK_COLORS[risk],
    }),
    viewBtn: {
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "6px 12px",
      borderRadius: 6,
      border: "1px solid var(--border)",
      background: "none",
      cursor: "pointer",
      fontSize: 13,
      fontFamily: "Inter, sans-serif",
    },
  };

  return (
    <div style={s.wrap}>
      <div style={s.heading}>Client Roster</div>
      <div style={s.sub}>
        Monitor your clients' mental wellness in real time
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: "Total clients", value: MOCK_CLIENTS.length, emoji: "👥" },
          {
            label: "Active today",
            value: MOCK_CLIENTS.filter((c) => c.lastCheckin === "Today").length,
            emoji: "✅",
          },
          { label: "Risk alerts", value: totalAlerts, emoji: "🚨" },
          { label: "Avg mood score", value: avgMood, emoji: "📊" },
        ].map((stat) => (
          <div key={stat.label} style={s.stat}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.emoji}</div>
            <div style={s.statVal}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={15} style={s.searchIcon} />
          <input
            style={s.searchInput}
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button style={s.addBtn}>
          <UserPlus size={15} /> Add client
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={s.table}>
          <thead>
            <tr>
              {[
                "Client",
                "Last check-in",
                "Avg mood",
                "Trend",
                "Top emotions",
                "Risk",
                "",
              ].map((h) => (
                <th key={h} style={s.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} style={{ background: "var(--bg)" }}>
                <td style={s.td}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "#0a0a0a",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{client.name}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {client.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  style={{
                    ...s.td,
                    color:
                      client.lastCheckin === "Today"
                        ? "var(--calm)"
                        : "var(--muted)",
                  }}
                >
                  {client.lastCheckin}
                </td>
                <td style={s.td}>
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        client.avgMood >= 7
                          ? "var(--calm)"
                          : client.avgMood >= 4
                            ? "var(--warning)"
                            : "var(--alert)",
                    }}
                  >
                    {client.avgMood}/10
                  </span>
                </td>
                <td style={s.td}>
                  {client.trend === "up" ? (
                    <TrendingUp size={16} color="var(--calm)" />
                  ) : client.trend === "down" ? (
                    <TrendingDown size={16} color="var(--alert)" />
                  ) : (
                    <Minus size={16} color="var(--muted)" />
                  )}
                </td>
                <td style={s.td}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {client.emotions.map((e) => (
                      <span
                        key={e}
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "var(--bg2)",
                          color: "var(--muted)",
                        }}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={s.td}>
                  <span style={s.riskBadge(client.risk)}>{client.risk}</span>
                </td>
                <td style={s.td}>
                  <button
                    style={s.viewBtn}
                    onClick={() => onViewClient(client.id, client.name)}
                  >
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
