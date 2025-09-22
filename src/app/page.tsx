"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const defaultCampus = {
  name: "CLASSIFY AI",
  logoUrl: "/only-logo.png",
  hindiName: "Smart Attendance System and Campus Management",
};

export default function Home() {
  const [campusData, setCampusData] = useState(defaultCampus);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCampusBranding = async () => {
      // 1. Check localStorage for a saved campus slug.
      const savedSlug = localStorage.getItem('lastCampusSlug');

      if (savedSlug) {
        try {
          // 2. If a slug is found, fetch that campus's data.
          const response = await fetch(`/api/campus/${savedSlug}`);
          if (response.ok) {
            const data = await response.json();
            setCampusData({
              name: data.name,
              logoUrl: data.logoUrl || defaultCampus.logoUrl,
              hindiName: data.hindiName || defaultCampus.hindiName,
            });
          }
        } catch (error) {
          console.error("Failed to fetch campus data:", error);
          // If fetch fails, we'll just show the default.
        }
      }
      
      setIsLoading(false);
    };

    loadCampusBranding();
  }, []);

  // Show a blank screen while checking localStorage to prevent content flickering
  if (isLoading) {
    return <div className="min-h-screen bg-black"></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center space-y-4">
      <Image
        src={campusData.logoUrl}
        alt={`${campusData.name} Logo`}
        width={150}
        height={150}
        priority
      />

      <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
        {campusData.name.toUpperCase()}
      </h1>
      
      <h6 className="text-white text-sm sm:text-base leading-tight">
        {campusData.hindiName}
      </h6>

      <Link
        href="/auth/login"
        className="mt-4 bg-blue-500 flex items-center justify-center h-12 px-8 text-lg sm:text-xl w-auto rounded text-white hover:bg-blue-600 transition"
      >
        Login
      </Link>
    </div>
  );
}