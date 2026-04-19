"use client";

import { useGreeting } from "@/hooks/useGreeting";

interface GreetingHeaderProps {
  name?: string;
}

export function GreetingHeader({ name = "there" }: GreetingHeaderProps) {
  const { period } = useGreeting(name);

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
        Good {period},{" "}
        <span className="capitalize">{name}</span>
      </h1>
      <h2 className="text-3xl font-bold mt-1 tracking-tight">
        How Can I{" "}
        <span className="text-[var(--accent)]">Assist You Today?</span>
      </h2>
    </div>
  );
}
