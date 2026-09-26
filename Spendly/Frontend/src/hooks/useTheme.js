import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "spendly-theme";

function getInitialTheme() {
  // 1. Previously saved choice wins
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  // 2. Otherwise follow the operating system preference
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

// Applies the theme by toggling a class on <html>, so every CSS variable
// (light or dark palette) switches at once. Also persists the choice.
export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme; // native inputs follow too
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // If the user has never picked a theme, follow live OS setting changes
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) setTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}
