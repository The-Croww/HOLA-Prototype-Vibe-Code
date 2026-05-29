import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "../App";

const API = import.meta.env.VITE_API_URL ?? "";

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      if (data.user.role !== "psychologist" && data.user.role !== "admin") {
        setError("This portal is for psychologists only.");
        return;
      }
      signIn({ ...data.user, token: data.token });
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const s: Record<string, React.CSSProperties> = {
    wrap: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg2)",
    },
    card: {
      background: "var(--bg)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: 40,
      width: 400,
    },
    logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
    logoIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    heading: { fontSize: 22, fontWeight: 600, marginBottom: 6 },
    sub: { fontSize: 14, color: "var(--muted)", marginBottom: 28 },
    label: { fontSize: 12, fontWeight: 500, marginBottom: 6, display: "block" },
    input: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid var(--border)",
      fontSize: 14,
      fontFamily: "Inter, sans-serif",
      outline: "none",
      marginBottom: 16,
    },
    btn: {
      width: "100%",
      padding: "12px",
      borderRadius: 8,
      background: "#0a0a0a",
      color: "#fff",
      border: "none",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "Inter, sans-serif",
    },
    error: { color: "var(--alert)", fontSize: 13, marginBottom: 16 },
    hint: {
      fontSize: 12,
      color: "var(--muted)",
      marginTop: 20,
      textAlign: "center" as const,
    },
  };

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <Heart size={18} color="#3dd68c" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              HOLA! Life Buddy
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Clinician Portal
            </div>
          </div>
        </div>
        <div style={s.heading}>Welcome back</div>
        <div style={s.sub}>Sign in to your psychologist account</div>
        {error && <div style={s.error}>{error}</div>}
        <label style={s.label}>Email</label>
        <input
          style={s.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@clinic.com"
        />
        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <button style={s.btn} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <div style={s.hint}>
          Don't have an account? Ask your admin to create one.
        </div>
      </div>
    </div>
  );
}
