"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  /** Resolved theme actually applied right now */
  resolved: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: "system",
  setPreference: () => {},
  resolved: "light",
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem("cb-theme") as ThemePreference | null;
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const pref = getInitialPreference();
    setPreferenceState(pref);
  }, []);

  const applyTheme = useCallback(
    (pref: ThemePreference) => {
      const theme = pref === "system" ? getSystemTheme() : pref;
      setResolved(theme);
      document.documentElement.setAttribute("data-theme", theme);
    },
    []
  );

  // Apply whenever preference changes
  useEffect(() => {
    applyTheme(preference);
  }, [preference, applyTheme]);

  // Listen for OS-level theme changes when preference is "system"
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference, applyTheme]);

  const setPreference = useCallback(
    (pref: ThemePreference) => {
      setPreferenceState(pref);
      localStorage.setItem("cb-theme", pref);
      applyTheme(pref);
    },
    [applyTheme]
  );

  return (
    <ThemeContext.Provider value={{ preference, setPreference, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}
