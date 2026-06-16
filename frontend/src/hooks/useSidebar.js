import { createContext, useContext, useState, useEffect } from "react";

export const SidebarContext = createContext(null);

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar_collapsed", collapsed);
    } catch {}
    const layout = document.querySelector(".dashboard-layout");
    if (layout)
      layout.style.gridTemplateColumns = collapsed ? "64px 1fr" : "234px 1fr";
  }, [collapsed]);

  const toggle = () => setCollapsed((v) => !v);
  return { collapsed, toggle };
}

export const useSidebarContext = () => useContext(SidebarContext);
