// src/ThemeProvider.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthProvider";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const user = useAuth();
  const [theme, setTheme] = useState({
    color: "#b91c1c",
    darkMode: false,
  });

  // Load theme
  useEffect(() => {
    if (!user) return;
    const fetchTheme = async () => {
      const ref = doc(db, `shops/${user.uid}/settings/theme`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTheme(snap.data());
      }
    };
    fetchTheme();
  }, [user]);

  // Update CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", theme.color);
    document.documentElement.style.setProperty(
      "--primary-color-hover",
      theme.color
    );
    document.documentElement.setAttribute(
      "data-theme",
      theme.darkMode ? "dark" : "light"
    );
  }, [theme]);

  const saveTheme = async (newTheme) => {
    if (!user) return;
    const ref = doc(db, `shops/${user.uid}/settings/theme`);
    await setDoc(ref, newTheme, { merge: true });
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, saveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
