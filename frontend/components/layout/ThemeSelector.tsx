"use client";

import { useTheme, ThemePreference } from "./ThemeProvider";

const options: { label: string; icon: string; value: ThemePreference }[] = [
  { label: "Light", icon: "☀️", value: "light" },
  { label: "Dark", icon: "🌙", value: "dark" },
  { label: "System", icon: "💻", value: "system" },
];

export default function ThemeSelector() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-selector-wrap">
      <p className="theme-selector-label">APPEARANCE</p>
      <div className="theme-selector-btns">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setPreference(opt.value)}
            className={`theme-btn${preference === opt.value ? " theme-btn--active" : ""}`}
            aria-pressed={preference === opt.value}
            title={opt.label}
          >
            <span className="theme-btn-icon">{opt.icon}</span>
            <span className="theme-btn-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
