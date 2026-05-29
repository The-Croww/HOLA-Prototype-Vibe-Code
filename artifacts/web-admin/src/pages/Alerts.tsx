import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";

const MOCK_ALERTS = [
  {
    id: "1",
    clientId: "3",
    clientName: "Ana Reyes",
    type: "mood_drop",
    message: "Mood below 3 for 3 consecutive days",
    time: "2 hours ago",
    reviewed: false,
    severity: "high",
  },
  {
    id: "2",
    clientId: "2",
    clientName: "Juan dela Cruz",
    type: "no_checkin",
    message: "No check-in for 5 days",
    time: "Yesterday",
    reviewed: false,
    severity: "medium",
  },
  {
    id: "3",
    clientId: "5",
    clientName: "Sofia Lim",
    type: "task_overdue",
    message: "Assigned breathing exercise is 3 days overdue",
    time: "3 days ago",
    reviewed: true,
    severity: "low",
  },
];

const SEV_COLORS: Record<string, string> = {
  high: "#ff6b6b",
  medium: "#ffb547",
  low: "#5b9cf6",
};

export function Alerts({
  onViewClient,
}: {
  onViewClient: (id: string, name: string) => void;
}) {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const markReviewed = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a)),
    );
  };

  const s: Record<string, React.CSSProperties> = {
    wrap: { padding: 32 },
    heading: { fontSize: 24, fontWeight: 600, marginBottom: 6 },
    sub: { fontSize: 14, color: "var(--muted)", marginBottom: 28 },
    alertCard: (reviewed: boolean): React.CSSProperties => ({
      background: reviewed ? "var(--bg2)" : "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 18,
      marginBottom: 12,
      opacity: reviewed ? 0.6 : 1,
    }),
    alertHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    badge: (sev: string): React.CSSProperties => ({
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 500,
      background: SEV_COLORS[sev] + "22",
      color: SEV_COLORS[sev],
    }),
    actions: { display: "flex", gap: 8, marginTop: 12 },
    btn: (primary: boolean): React.CSSProperties => ({
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "7px 14px",
      borderRadius: 7,
      border: primary ? "none" : "1px solid var(--border)",
      background: primary ? "#0a0a0a" : "none",
      color: primary ? "#fff" : "var(--fg)",
      fontSize: 13,
      cursor: "pointer",
      fontFamily: "Inter, sans-serif",
    }),
  };

  return (
    <div style={s.wrap}>
      <div style={s.heading}>Risk Alerts</div>
      <div style={s.sub}>
        {alerts.filter((a) => !a.reviewed).length} unreviewed alerts
      </div>
      {alerts.map((alert) => (
        <div key={alert.id} style={s.alertCard(alert.reviewed)}>
          <div style={s.alertHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={18} color={SEV_COLORS[alert.severity]} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {alert.clientName}
                </div>
                <div
                  style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}
                >
                  {alert.message}
                </div>
              </div>
            </div>
            <span style={s.badge(alert.severity)}>{alert.severity}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {alert.time}
          </div>
          <div style={s.actions}>
            <button
              style={s.btn(true)}
              onClick={() => onViewClient(alert.clientId, alert.clientName)}
            >
              <Eye size={13} /> View client
            </button>
            {!alert.reviewed && (
              <button
                style={s.btn(false)}
                onClick={() => markReviewed(alert.id)}
              >
                <CheckCircle size={13} /> Mark reviewed
              </button>
            )}
            {alert.reviewed && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--calm)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle size={13} /> Reviewed
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
