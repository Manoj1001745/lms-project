import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  clearAdminAuthCookie,
  clearUserAuthCookie,
  setAdminAuthCookie,
  setUserAuthCookie,
} from "@/lib/auth-cookies";

type AuthState = {
  token: string | null;
  role: "admin" | "student" | "professor" | null;
  setSession: (token: string, role: AuthState["role"]) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      setSession: (token, role) => {
        if (role === "admin") {
          setAdminAuthCookie(token);
        } else if (role === "student" || role === "professor") {
          setUserAuthCookie(token);
        }
        set({ token, role });
      },
      clearSession: () => {
        clearAdminAuthCookie();
        clearUserAuthCookie();
        set({ token: null, role: null });
      },
    }),
    {
      name: "learninghun-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, role: state.role }),
    },
  ),
);

