"use client";

import { useEffect } from "react";
import { getAdminAuthCookie, getUserAuthCookie, setAdminAuthCookie, setUserAuthCookie } from "@/lib/auth-cookies";
import { useAuthStore } from "@/stores/auth.store";

export function SessionHydrator() {
  useEffect(() => {
    const { token, role, setSession } = useAuthStore.getState();
    const userCookie = getUserAuthCookie();
    const adminCookie = getAdminAuthCookie();

    if (userCookie && !token && role !== "admin") {
      setSession(userCookie, role ?? "student");
      return;
    }

    if (adminCookie && !token && role === "admin") {
      setSession(adminCookie, "admin");
      return;
    }

    if (token && !userCookie && (role === "student" || role === "professor")) {
      setUserAuthCookie(token);
    }

    if (token && !adminCookie && role === "admin") {
      setAdminAuthCookie(token);
    }
  }, []);

  return null;
}
