import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

function subscribe() {
  return () => {};
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem("autocv_theme") as Theme | null;
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("autocv_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  return { theme, toggleTheme, isDark: theme === "dark", mounted };
}
