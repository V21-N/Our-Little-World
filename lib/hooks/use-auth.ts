"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api/client";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export interface CurrentCouple {
  id: string;
  coupleName: string | null;
  relationshipStartDate: string;
  coverImageUrl: string | null;
  theme: string;
  inviteCode: string;
  createdAt?: string;
}

export interface CurrentProfile {
  id: string;
  fullName: string;
  nickname: string | null;
  birthday: string | null;
  avatarUrl: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<CurrentProfile | null>(null);
  const [couple, setCouple] = useState<CurrentCouple | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const sessionRes = await authClient.getSession();
      if (sessionRes.data?.user) {
        const u = sessionRes.data.user as any;
        setUser({ id: u.id, name: u.name, email: u.email });

        const profileRes = await apiFetch<CurrentProfile>("/api/profile");
        if (profileRes.success) setProfile(profileRes.data);

        const coupleRes = await apiFetch<CurrentCouple | null>("/api/couples/current");
        if (coupleRes.success) setCouple(coupleRes.data);
      } else {
        setUser(null);
        setProfile(null);
        setCouple(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    setUser(null);
    setProfile(null);
    setCouple(null);
  }, []);

  return { user, profile, couple, loading, refresh, signOut };
}