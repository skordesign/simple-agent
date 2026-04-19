"use client";

import { useMemo } from "react";

export function useGreeting(name = "there") {
  return useMemo(() => {
    const hour = new Date().getHours();
    let period: string;
    if (hour < 12) period = "Morning";
    else if (hour < 17) period = "Afternoon";
    else period = "Evening";

    return { period, name };
  }, [name]);
}
