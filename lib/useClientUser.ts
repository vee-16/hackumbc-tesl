"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

const KEY = "sf_user";

export function useClientUser() {
  const { data } = useSession();
  const sessionUser = data?.user;

  useEffect(() => {
    if (!sessionUser) return;
    const cached = {
      id: (sessionUser as any).uid ?? sessionUser.email ?? crypto.randomUUID(),
      name: sessionUser.name ?? "User",
      email: sessionUser.email ?? "",
      organization: "", // fill later from profile
    };
    localStorage.setItem(KEY, JSON.stringify(cached));
  }, [sessionUser]);

  return sessionUser;
}

export function getCachedUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
