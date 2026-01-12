"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faDisplay } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { ActionMenu } from "@/components/shared/ActionMenu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the icon to display based on current theme - updates reactively
  const themeIcon = useMemo(() => {
    if (!mounted || !theme) return faSun;
    if (theme === "system") return faDisplay;
    if (theme === "dark") return faMoon;
    return faSun;
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled className="h-9 w-9 rounded-full">
        <FontAwesomeIcon icon={faSun} className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <ActionMenu
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full hover:bg-muted/50 hover:text-foreground"
        >
          <FontAwesomeIcon icon={themeIcon} className="h-4 w-4" />
        </Button>
      }
      items={[
        {
          label: "Light",
          icon: <FontAwesomeIcon icon={faSun} className="h-4 w-4" />,
          onClick: () => setTheme("light"),
          active: theme === "light",
        },
        {
          label: "Dark",
          icon: <FontAwesomeIcon icon={faMoon} className="h-4 w-4" />,
          onClick: () => setTheme("dark"),
          active: theme === "dark",
        },
        {
          label: "System",
          icon: <FontAwesomeIcon icon={faDisplay} className="h-4 w-4" />,
          onClick: () => setTheme("system"),
          active: theme === "system",
        },
      ]}
      align="end"
      width="w-40"
    />
  );
}
