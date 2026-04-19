"use client";

export function OrbAnimation() {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, #818cf8 0%, #a78bfa 40%, transparent 70%)",
          filter: "blur(12px)",
          animation: "orb-pulse 4s ease-in-out infinite",
        }}
      />
      {/* Core orb */}
      <div
        className="relative w-14 h-14 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, #c7d2fe, #818cf8 40%, #6366f1 65%, #4338ca 100%)",
          boxShadow:
            "0 0 24px rgba(99, 102, 241, 0.5), 0 0 48px rgba(99, 102, 241, 0.2)",
          animation: "orb-pulse 4s ease-in-out infinite",
        }}
      />
      {/* Inner highlight */}
      <div
        className="absolute top-3 left-4 w-3 h-3 rounded-full opacity-60"
        style={{
          background: "rgba(255,255,255,0.9)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}
