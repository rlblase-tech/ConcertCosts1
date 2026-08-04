"use client";

import { Palette } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/types";

type Props = {
  className?: string;
  compact?: boolean;
};

export function ThemeSelector({ className = "", compact = false }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <label
      className={`flex items-center gap-2 ${className}`}
      title="Change app look"
    >
      <Palette className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      {!compact && (
        <span className="text-sm font-medium whitespace-nowrap">Theme</span>
      )}
      <select
        className="select select-bordered select-sm w-full max-w-[10rem] capitalize"
        value={theme}
        onChange={(e) => setTheme(e.target.value as (typeof THEMES)[number])}
        aria-label="Choose visual theme"
      >
        {THEMES.map((t) => (
          <option key={t} value={t} className="capitalize">
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
