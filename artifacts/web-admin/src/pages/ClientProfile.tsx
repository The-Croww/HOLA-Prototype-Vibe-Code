import React, { useState } from "react";
import { ArrowLeft, Send, Plus, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MOCK_MOOD_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  score: Math.floor(Math.random() * 6) + 3,
}));

const MOCK_JOURNALS = [
  {
    id: "1",
    date: "Today",
    title: "Feeling a bit overwhelmed",
    preview:
      "Had a tough day at work but tried to use the breathing exercises...",
    shared: true,
  },
  {
    id: "2",
    date: "Yesterday",
    title: "Small wins",
    preview: "I managed to go for a walk today which felt really good...",
    shared: true,
  },
  {
    id: "3",
    date: "3 days ago",
    title: "Private entry",
    preview: "🔒 This entry is private",
    shared: false,
  },
];

const TASK_TYPES = [
  "Breathing exercise",
  "Journal prompt",
  "Meditation",
  "CBT worksheet",
  "Custom message",
];

export function ClientProfile({
  clientId,
  clientName,
  onBack,
}: {
  clientId: string;
  clientName: string;
  onBack: () => void;
}) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(TASK_TYPES[0]);
  const [taskNote, setTaskNote] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "journal" | "notes">(
    "overview",
  );

  const s: Record<string, React.CSSProperties> = {
    wrap: { padding: 32 },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 14,
      color: "var(--muted)",
      marginBottom: 24,
      fontFamily: "Inter, sans-serif",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "#0a0a0a",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      fontWeight: 600,
    },
    name: { fontSize: 22, fontWeight: 600 },
    sub: { fontSize: 14, color: "var(--muted)" },
    assignBtn: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 18px",
      borderRadius: 8,
      background: "#0a0a0a",
      color: "#fff",
      border: "none",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "Inter, sans-serif",
    },
    tabs: {
      display: "flex",
      gap: 4,
      marginBottom: 24,
      background: "var(--bg2)",
      padding: 4,
      borderRadius: 10,
      width: "fit-content",
    },
    tab: (active: boolean): React.CSSProperties => ({
      padding: "8px 16px",
      borderRadius: 7,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      fontFamily: "Inter, sans-serif",
      background: active ? "#0a0a0a" : "transparent",
      color: active ? "#fff" : "var(--muted)",
    }),
    card: {
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
    },
    cardTitle: { fontSize: 15, fontWeight: 600, marginBottom: 16 },
    statGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 12,
      marginBottom: 16,
    },
    statBox: {
      background: "var(--bg2)",
      borderRadius: 10,
      padding: 14,
      textAlign: "center" as const,
    },
    statVal: { fontSize: 22, fontWeight: 600, marginBottom: 4 },
    statLabel: { fontSize: 11, color: "var(--muted)" },
    journalRow: { padding: "14px 0", borderBottom: "1px solid var(--border)" },
    notesInput: {
      width: "100%",
      minHeight: 120,
      padding: 14,
      borderRadius: 8,
      border: "1px solid var(--border)",
      fontSize: 14,
      fontFamily: "Inter, sans-serif",
      outline: "none",
      resize: "vertical" as const,
    },
    saveBtn: {
      marginTop: 12,
      padding: "10px 20px",
      borderRadius: 8,
      background: "#0a0a0a",
      color: "#fff",
      border: "none",
      fontSize: 14,
      cursor: "pointer",
      fontFamily: "Inter, sans-serif",
    },
    overlay: {
      position: "fixed" as const,
      inset: 0,
      background: "#00000055",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
    },
    modal: {
      background: "var(--bg)",
      borderRadius: 16,
      padding: 28,
      width: 440,
      border: "1px solid var(--border)",
    },
  };

  return (
    <div style={s.wrap}>
      <button style={s.backBtn} onClick={onBack}>
        <ArrowLeft size={16} /> Back to clients
      </button>

      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={s.avatar}>{clientName.charAt(0)}</div>
          <div>
            <div style={s.name}>{clientName}</div>
            <div style={s.sub}>Client since March 2025 · Linked ✓</div>
          </div>
        </div>
        <button style={s.assignBtn} onClick={() => setShowTaskModal(true)}>
          <Plus size={15} /> Assign task
        </button>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {(["overview", "journal", "notes"] as const).map((t) => (
          <button
            key={t}
            style={s.tab(activeTab === t)}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <div style={s.statGrid}>
            {[
              { label: "Avg mood", value: "6.4", emoji: "📊" },
              { label: "Streak", value: "5 days", emoji: "🔥" },
              { label: "Total logs", value: "24", emoji: "📝" },
              { label: "Sessions", value: "8", emoji: "🧘" },
            ].map((stat) => (
              <div key={stat.label} style={s.statBox}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>
                  {stat.emoji}
                </div>
                <div style={s.statVal}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>14-day mood trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MOCK_MOOD_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                />
                <YAxis
                  domain={[1, 10]}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3dd68c"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3dd68c" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Recent emotions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "Anxious",
                "Calm",
                "Hopeful",
                "Tired",
                "Grateful",
                "Stressed",
              ].map((e) => (
                <span
                  key={e}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "var(--bg2)",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Journal Tab */}
      {activeTab === "journal" && (
        <div style={s.card}>
          <div style={s.cardTitle}>Shared journal entries</div>
          {MOCK_JOURNALS.filter((j) => j.shared).map((j) => (
            <div key={j.id} style={s.journalRow}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>{j.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  {j.date}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                {j.preview}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div style={s.card}>
          <div style={s.cardTitle}>
            <FileText size={15} style={{ display: "inline", marginRight: 6 }} />
            Session notes (private)
          </div>
          <div
            style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}
          >
            These notes are only visible to you.
          </div>
          <textarea
            style={s.notesInput}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your session notes here..."
          />
          <button style={s.saveBtn}>Save notes</button>
        </div>
      )}

      {/* Assign Task Modal */}
      {showTaskModal && (
        <div style={s.overlay} onClick={() => setShowTaskModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>
              Assign task to {clientName}
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
              Task type
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 16,
              }}
            >
              {TASK_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTask(t)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1px solid ${selectedTask === t ? "#0a0a0a" : "var(--border)"}`,
                    background: selectedTask === t ? "#0a0a0a" : "transparent",
                    color: selectedTask === t ? "#fff" : "var(--fg)",
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>
              Note for client (optional)
            </div>
            <textarea
              value={taskNote}
              onChange={(e) => setTaskNote(e.target.value)}
              placeholder="e.g. Try the 4-7-8 breathing before bed tonight"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "1px solid var(--border)",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                minHeight: 80,
                outline: "none",
                marginBottom: 16,
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Task "${selectedTask}" assigned to ${clientName}!`);
                  setShowTaskModal(false);
                }}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 8,
                  background: "#0a0a0a",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <Send size={13} style={{ display: "inline", marginRight: 6 }} />
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
