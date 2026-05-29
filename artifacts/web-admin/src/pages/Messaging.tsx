import React, { useState } from "react";
import { Send } from "lucide-react";

const CLIENTS = [
  { id: "1", name: "Maria Santos" },
  { id: "2", name: "Juan dela Cruz" },
  { id: "3", name: "Ana Reyes" },
];

const INIT_MESSAGES: Record<
  string,
  { role: string; content: string; time: string }[]
> = {
  "1": [
    {
      role: "client",
      content:
        "Hi doc, just wanted to say the breathing exercises really helped today!",
      time: "10:30 AM",
    },
  ],
  "2": [
    {
      role: "psychologist",
      content: "Hi Juan, how are you feeling today?",
      time: "Yesterday",
    },
  ],
  "3": [],
};

export function Messaging() {
  const [selected, setSelected] = useState("1");
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selected]: [
        ...(prev[selected] ?? []),
        { role: "psychologist", content: input.trim(), time: "Now" },
      ],
    }));
    setInput("");
  };

  const s: Record<string, React.CSSProperties> = {
    wrap: { display: "flex", height: "100vh" },
    sidebar: {
      width: 240,
      borderRight: "1px solid var(--border)",
      padding: 20,
    },
    sideTitle: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--muted)",
      marginBottom: 16,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    clientBtn: (active: boolean): React.CSSProperties => ({
      display: "block",
      width: "100%",
      padding: "10px 12px",
      borderRadius: 8,
      border: "none",
      background: active ? "var(--bg2)" : "none",
      textAlign: "left",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: active ? 500 : 400,
      fontFamily: "Inter, sans-serif",
      marginBottom: 4,
    }),
    chat: { flex: 1, display: "flex", flexDirection: "column" },
    chatHeader: {
      padding: "16px 24px",
      borderBottom: "1px solid var(--border)",
      fontWeight: 600,
      fontSize: 16,
    },
    messages: {
      flex: 1,
      padding: 24,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    bubble: (mine: boolean): React.CSSProperties => ({
      maxWidth: "65%",
      alignSelf: mine ? "flex-end" : "flex-start",
      padding: "10px 14px",
      borderRadius: 16,
      borderBottomRightRadius: mine ? 4 : 16,
      borderBottomLeftRadius: mine ? 16 : 4,
      background: mine ? "#0a0a0a" : "var(--bg2)",
      color: mine ? "#fff" : "var(--fg)",
      fontSize: 14,
      lineHeight: 1.5,
    }),
    time: (mine: boolean): React.CSSProperties => ({
      fontSize: 11,
      color: "var(--muted)",
      alignSelf: mine ? "flex-end" : "flex-start",
      marginTop: -6,
    }),
    inputRow: {
      padding: "16px 24px",
      borderTop: "1px solid var(--border)",
      display: "flex",
      gap: 10,
    },
    input: {
      flex: 1,
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid var(--border)",
      fontSize: 14,
      fontFamily: "Inter, sans-serif",
      outline: "none",
    },
    sendBtn: {
      padding: "10px 16px",
      borderRadius: 8,
      background: "#0a0a0a",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
    },
  };

  const clientName = CLIENTS.find((c) => c.id === selected)?.name ?? "";

  return (
    <div style={s.wrap}>
      <div style={s.sidebar}>
        <div style={s.sideTitle}>Messages</div>
        {CLIENTS.map((c) => (
          <button
            key={c.id}
            style={s.clientBtn(selected === c.id)}
            onClick={() => setSelected(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div style={s.chat}>
        <div style={s.chatHeader}>{clientName}</div>
        <div style={s.messages}>
          {(messages[selected] ?? []).length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 14,
                marginTop: 40,
              }}
            >
              No messages yet. Say hello 👋
            </div>
          )}
          {(messages[selected] ?? []).map((m, i) => (
            <React.Fragment key={i}>
              <div style={s.bubble(m.role === "psychologist")}>{m.content}</div>
              <div style={s.time(m.role === "psychologist")}>{m.time}</div>
            </React.Fragment>
          ))}
        </div>
        <div style={s.inputRow}>
          <input
            style={s.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${clientName}...`}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button style={s.sendBtn} onClick={send}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
