import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ThemeMode = "dark" | "light";
type ViewMode = "full" | "simple";

interface ThemeContextType {
  themeMode: ThemeMode;
  viewMode: ViewMode;
  setThemeMode: (mode: ThemeMode) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleTheme: () => void;
  toggleViewMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme-mode");
    return (saved as ThemeMode) || "dark";
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem("view-mode");
    return (saved as ViewMode) || "full";
  });

  useEffect(() => {
    localStorage.setItem("theme-mode", themeMode);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("view-mode", viewMode);
    document.documentElement.classList.remove("simple-mode", "full-mode");
    document.documentElement.classList.add(`${viewMode}-mode`);
  }, [viewMode]);

  const toggleTheme = () => setThemeMode(prev => prev === "dark" ? "light" : "dark");
  const toggleViewMode = () => setViewMode(prev => prev === "full" ? "simple" : "full");

  return (
    <ThemeContext.Provider value={{ themeMode, viewMode, setThemeMode, setViewMode, toggleTheme, toggleViewMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
