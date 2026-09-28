"use client";

import { createContext, useEffect, useState } from "react";
import { useContext } from "react";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyResolvedTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] =
    useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem(
      "facescan-theme",
    ) as ThemePreference | null;

    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolveTheme = () => {
      const nextTheme =
        theme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : theme;

      applyResolvedTheme(nextTheme);
      setResolvedTheme(nextTheme);
    };

    resolveTheme();

    const handleSystemChange = () => {
      if (theme === "system") {
        resolveTheme();
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [theme]);

  const setTheme = (nextTheme: ThemePreference) => {
    localStorage.setItem("facescan-theme", nextTheme);
    setThemeState(nextTheme);

    const resolved =
      nextTheme === "system" ? getSystemTheme() : nextTheme;

    applyResolvedTheme(resolved);
    setResolvedTheme(resolved);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
