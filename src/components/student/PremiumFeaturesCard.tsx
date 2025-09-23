"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Logo from "../apps/Logo";

type PremiumStatusResponse = {
  isPremium: boolean;
  plan: "Starter" | "Pro" | "Ultimate" | null;
  features: string[];
};

const PremiumFeaturesCard = ({ studentId, CampusId }: { studentId: string, CampusId:string }) => {
  const router = useRouter();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatusResponse | null>(null);

  const fetchPremiumStatus = async () => {
    try {
      const res = await fetch(`/api/student/status?studentId=${studentId}&campusId=${CampusId}`);
      const data: PremiumStatusResponse = await res.json();
      setPremiumStatus(data);
    } catch (error) {
      console.error("Error fetching premium status:", error);
    }
  };

  useEffect(() => {
    fetchPremiumStatus();
  }, []);

  const planColor =
    premiumStatus?.plan === "Ultimate"
      ? "rounded-3xl p-6 border border-yellow-400/30 shadow-xl bg-gradient-to-tr from-yellow-100/20 via-yellow-400/10 to-yellow-500/20 backdrop-blur-md"
      : premiumStatus?.plan === "Pro"
      ? "rounded-3xl p-6 border border-gray-400/30 shadow-xl bg-gradient-to-tr from-gray-100/20 via-gray-400/10 to-gray-500/20 backdrop-blur-md"
      : "bg-gradient-to-tl from-white/20 to-black/20 text-white";

const pColor = premiumStatus?.plan === "Ultimate"
      ? "text-yellow-600"
      : premiumStatus?.plan === "Pro"
      ? "text-gray-200"
      : "";
  return (
    <div
      className={`w-[20rem] 2xl:w-[29rem] h-66 grid-cols-2 rounded-4xl grid items-center justify-center border border-cyan-500 ${planColor}`}
    >
      {/* Left Side */}
      <div className="text-center px-2">
              <Image src={"/logo-nobg.png"} alt="logo" className="sm:w-35 2xl:w-[22rem] 2xl:h-[3.5rem] lg:w-[12rem] lg:ml-[1rem] lg:h-[3.5rem] sm:h-10" width={70} height={70} />
           
        <h2 className="text-xs font-bold mt-4 2xl:text-lg">
          {premiumStatus?.isPremium
            ? `You're on ${premiumStatus.plan} Plan`
            : "Go Premium"}
        </h2>
        <p className={`mt-1 text-xs 2xl:text-base ${pColor}`}>
          {premiumStatus?.isPremium
            ? "Exclusive premium features enabled"
            : "Unlock exclusive features and perks"}
        </p>
        {!premiumStatus?.isPremium && (
          <button
            onClick={() => router.push("/dashboard/student/premium")}
            className="mt-3 px-5 py-2 cursor-pointer bg-cyan-700 text-white rounded-full hover:bg-cyan-600 transition duration-300"
          >
            Upgrade Now
          </button>
        )}
      </div>

      {/* Right Side */}
      <div className="flex flex-col items-start px-2 text-xs text-white">
        {premiumStatus?.isPremium ? (
          <ul className="list-disc pl-4 max-h-40 overflow-y-auto">
            {premiumStatus.features.map((feature) => (
              <li className="text-xs 2xl:text-base ml-2.5 mb-3" key={feature}>{feature.replaceAll("_", " ")}</li>
            ))}
          </ul>
        ) : (
          <Image src="/books.png" alt="Books" width={120} height={120} />
        )}
      </div>
    </div>
  );
};

export default PremiumFeaturesCard;
