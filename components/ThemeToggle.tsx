"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-blue-800 text-white/50 w-9 h-9 flex items-center justify-center">
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-blue-800 text-white hover:bg-blue-900 transition-colors shadow-inner flex items-center justify-center relative overflow-hidden"
      title="Toggle theme"
    >
      <Sun className={`w-5 h-5 transition-all ${theme === 'dark' ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`} />
      <Moon className={`w-5 h-5 absolute transition-all ${theme === 'dark' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} />
    </button>
  );
}
