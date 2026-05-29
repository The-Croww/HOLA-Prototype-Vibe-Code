import React, { useState, createContext, useContext } from "react";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { ClientProfile } from "./pages/ClientProfile";
import { Alerts } from "./pages/Alerts";
import { Analytics } from "./pages/Analytics";
import { Messaging } from "./pages/Messaging";
import { Sidebar } from "./components/Sidebar";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  token: string;
}
interface AuthCtx {
  user: AuthUser | null;
  signIn: (u: AuthUser) => void;
  signOut: () => void;
}
export const AuthContext = createContext<AuthCtx>({
  user: null,
  signIn: () => {},
  signOut: () => {},
});
export const useAuth = () => useContext(AuthContext);

export type Page =
  | "dashboard"
  | "alerts"
  | "analytics"
  | "messaging"
  | { type: "client"; id: string; name: string };

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState<Page>("dashboard");

  if (!user) {
    return (
      <AuthContext.Provider
        value={{ user, signIn: setUser, signOut: () => setUser(null) }}
      >
        <Login />
      </AuthContext.Provider>
    );
  }

  const renderPage = () => {
    if (typeof page === "object" && page.type === "client") {
      return (
        <ClientProfile
          clientId={page.id}
          clientName={page.name}
          onBack={() => setPage("dashboard")}
        />
      );
    }
    switch (page) {
      case "alerts":
        return (
          <Alerts
            onViewClient={(id, name) => setPage({ type: "client", id, name })}
          />
        );
      case "analytics":
        return <Analytics />;
      case "messaging":
        return <Messaging />;
      default:
        return (
          <Dashboard
            onViewClient={(id, name) => setPage({ type: "client", id, name })}
          />
        );
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signIn: setUser, signOut: () => setUser(null) }}
    >
      <div
        style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}
      >
        <Sidebar
          currentPage={typeof page === "string" ? page : "dashboard"}
          onNavigate={setPage}
        />
        <main
          style={{
            flex: 1,
            marginLeft: 220,
            minHeight: "100vh",
            background: "var(--bg)",
          }}
        >
          {renderPage()}
        </main>
      </div>
    </AuthContext.Provider>
  );
}
