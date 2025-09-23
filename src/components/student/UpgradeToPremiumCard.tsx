"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const UpgradeToPremiumCard = () => {
  const router = useRouter();
  return (
    <div className="sm:w-full lg:h-56 sm:h-52 grid-cols-2 2xl:h-[18rem] rounded-4xl to-black/20 bg-gradient-to-tl from-white/20 grid sm:p-3  border border-cyan-500">
      <div className="text-center sm:h-full sm:space-y-3 text-white">
        <Image
          src={"/logo-nobg.png"}
          alt="Logo"
          className="sm:w-40 2xl:h-[4rem] 2xl:w-[25rem] lg:w-56 lg:h-10 sm:h-12"
          width={200}
          height={200}
        />
        <h2 className="text-xl font-bold 2xl:text-2xl 2xl:mt-5 mt-2">
          Go Premium
        </h2>
        <p className="mt-2 text-xs ml-2 2xl:text-lg">
          Unlock exclusive features and perks
        </p>
        <button
          onClick={() => router.push("/dashboard/student/premium")}
          className="mt-1 px-4 py-2 cursor-pointer bg-cyan-700 text-white rounded-full hover:bg-cyan-600 transition duration-300"
        >
          Upgrade Now
        </button>
      </div>
      <Image
        src={"/books.png"}
        alt="..."
        className="sm:h-72 lg:h-56 lg:-mt-[40px] 2xl:h-[20rem] sm:w-56 sm:-mt-20"
        width={200}
        height={200}
      />
    </div>
  );
};

export default UpgradeToPremiumCard;
