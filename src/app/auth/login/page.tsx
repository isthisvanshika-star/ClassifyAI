"use client";

import { showErrorMessage, showSuccessMessage } from "@/lib/helper";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const defaultCampus = {
  name: "CLASSIFY AI",
  logoUrl: "/only-logo.png",
  hindiName: "Smart Attendance System and Campus Management",
};

const Page = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [campusData, setCampusData] = useState(defaultCampus);

  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !name) {
      showErrorMessage("Please fill in both fields");
      return;
    }

    const res = await fetch(`/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem(`${data.user.role.toLowerCase()}Id`, data.user.id);
      localStorage.setItem("CampusID", data.user.campusId || "");
      showSuccessMessage("Login Successful");
      router.push(`/dashboard/${data.user.role.toLowerCase()}`);
    } else {
      showErrorMessage(data.message || "Login Failed!");
    }
  };

  useEffect(() => {
    const loadCampusBranding = async () => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.floor(Math.random() * 5) + 2;
        });
      }, 150);
      const campusID = localStorage.getItem("CampusID");

      if (campusID) {
        try {
          // 2. If a slug is found, fetch that campus's data.
          const response = await fetch(
            `/api/campus/details?campusID=${campusID}`
          );
          console.log(response);
          if (response.ok) {
            const data = await response.json();
            console.log(data[0].name);
            setCampusData({
              name: data[0].name,
              logoUrl: data[0].logoUrl || defaultCampus.logoUrl,
              hindiName: data[0].hindiName || defaultCampus.hindiName,
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
    const radius = 60;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black/5 text-cyan-400">
        <div className="relative w-36 h-36">
          {/* Circular progress */}
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="#1e293b"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="100"
              strokeDashoffset={`${100 - progress}`}
            />
          </svg>

          {/* Logo centered absolutely */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/only-logo.png"
              alt="ClassifyAI"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        <p className="mt-6 text-xl font-semibold">
          Loading Campus Details...
        </p>
        <p className="text-sm text-cyan-300">{progress}%</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {campusData.logoUrl && (
        <Image
          src={campusData.logoUrl}
          alt={`${campusData.name} Logo`}
          width={150}
          height={150}
          className="invert"
          priority
        />
      )}
      <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-semibold py-3 leading-tight">
        {campusData.name.toUpperCase()}
      </h1>
      <h6 className="text-white text-sm sm:text-base pb-6 leading-tight">
        {campusData.hindiName}
      </h6>
      <h1 className="text-3xl text-white font-bold pb-4">LOGIN</h1>

      <div className="flex flex-col space-y-4 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          autoComplete="off"
          className="p-2 rounded bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-500"
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          className="p-2 rounded bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-500"
          onChange={(event) => setName(event.target.value)}
        />
        <button
          onClick={handleLogin}
          className="border-2 border-white rounded p-2 text-white font-medium hover:bg-white hover:text-gray-900 transition-all duration-500"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Page;
