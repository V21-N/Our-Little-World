"use client";

import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "yugma-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia(DARK_QUERY).matches;
}

export function useTheme() {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    setDark(getInitialDark());
  }, []);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      window.localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  return { dark, toggle };
}