"use client";

import { useEffect, useState } from "react";

export default function AppVersionCard() {
  const [versionInfo, setVersionInfo] = useState<{
    appName: string;
    nextVersion: string;
    tauriVersion: string;
  } | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      const res = await fetch("/api/version");
      const data = await res.json();
      setVersionInfo(data);
    };
    fetchVersion();
  }, []);

  if (!versionInfo) return null;

  return (
        <p><span className="text-gray-400">Version:</span> {versionInfo.tauriVersion}</p>
  );
}
