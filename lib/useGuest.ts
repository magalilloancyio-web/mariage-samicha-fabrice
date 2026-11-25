"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadGuest, type Guest } from "./guest";

/** Current guest; sends them to the welcome page if they haven't given their name yet. */
export function useGuest(required = true) {
  const router = useRouter();
  const [guest, setGuest] = useState<Guest | null | undefined>(undefined);
  useEffect(() => {
    const g = loadGuest();
    setGuest(g);
    if (!g && required) router.replace("/");
  }, [required, router]);
  return guest;
}
