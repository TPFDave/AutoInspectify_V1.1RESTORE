// src/NavBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";

export default function NavBar() {
  const user = useAuth();
  const auth = getAuth();
  const { theme } = useTheme();

  const handleLogout = () => signOut(auth).catch(console.error);

  const navLinks = [
    { to: "/", label: "Dashboard" },
    { to: "/checkin", label: "Check‑In" },
    { to: "/inspections", label: "Inspections" },
    { to: "/clients", label: "Clients" },
    { to: "/shop", label: "Shop" },
  ];

  return (
    <nav className="flex flex-wrap justify-between items-center gap-2 mb-6 p-2 border-b">
      <div className="flex flex-wrap gap-2">
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-3 py-1 rounded border ${
                isActive
                  ? "text-white"
                  : ""
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? theme.color : "transparent",
              borderColor: theme.color,
              color: isActive ? "#ffffff" : theme.color,
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      {user && (
        <button
          onClick={handleLogout}
          className="text-sm underline"
          style={{ color: theme.color }}
        >
          Log Out
        </button>
      )}
    </nav>
  );
}
