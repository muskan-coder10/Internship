import { useState } from "react";
import { SidebarContext } from "./SidebarContext.js";

export function SidebarProvider({ children }) {
  
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 900;
    }
    return false;
  });

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}