"use client";

import { usePathname } from "next/navigation";

export default function RootBackground() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/assistant");

  if (isAdmin) return null;

  return (
    <div
      className="absolute inset-0 bg-cover bg-center blur-sm scale-110 z-0"
      style={{ backgroundImage: 'url("/bg-5.webp")' }}
    />
  );
}
