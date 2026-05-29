import React from "react";
import {
  LayoutDashboard,
  Bell,
  BarChart2,
  MessageCircle,
  LogOut,
  Heart,
} from "lucide-react";
import { useAuth, Page } from "../App";

const NAV = [
  { id: "dashboard", icon: LayoutDashboard, label: "Clients" },
  { id: "alerts", icon: Bell, label: "Alerts" },
  { id: "analytics", icon: BarChart2, label: "Analytics" },
  { id: "messaging", icon: MessageCircle, label: "Messages" },
];

export function Sidebar({
  currentPage,
  onNavigate,
}: {
  currentPage: string;
  onNavigate: (p: Page) => void;
}) {
  const { user, signOut } = useAuth();

  return (
    <aside
      style={{
        width: 220,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "0 20px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={16} color="#3dd68c" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>HOLA!</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Clinician Portal
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {NAV.map(({ id, icon: Icon, label }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id as Page)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: active ? "var(--fg)" : "transparent",
                color: active ? "var(--bg)" : "var(--muted)",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "Inter, sans-serif",
                transition: "background 0.15s",
              }}
            >
              <Icon size={17} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div
        style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}
      >
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>
          {user?.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
          {user?.email}
        </div>
        <button
          onClick={signOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--alert)",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
