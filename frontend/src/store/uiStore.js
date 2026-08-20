import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      language: "en",
      sidebarOpen: true,
      toggleLanguage: () =>
        set((s) => ({ language: s.language === "en" ? "hi" : "en" })),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: "krishi-ui" }
  )
);
