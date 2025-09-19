"use client";
import React from "react";
import StatsCard from "./StatsCard";
import { motion } from "framer-motion";

const StatsRow = ({
  stats,
  titleArray,
  showExpiredCard = true,
}: {
  stats: {
    totalUsers: number;
    premiumUsers: number;
    proUsers: number;
    ultimateUsers: number;
    expiredPremiums: number;
  };
  titleArray: string[];
  showExpiredCard?: boolean;
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  const cards: { title: string; value: number; color?: string }[] = [
    { title: titleArray[0], value: stats.totalUsers },
    { title: titleArray[1], value: stats.premiumUsers },
    { title: titleArray[2], value: stats.ultimateUsers },
    { title: titleArray[3], value: stats.proUsers },
  ];

  if (showExpiredCard) {
    cards.push({
      title: "Expired Premiums",
      value: stats.expiredPremiums,
      color: "border-red-500",
    });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
        {[
            { title: titleArray[0], value: stats.totalUsers },
            { title: "Total Premium", value: stats.premiumUsers },
            { title: titleArray[1], value: stats.proUsers },
            { title: titleArray[2], value: stats.ultimateUsers },
            { title: titleArray[3], value: stats.expiredPremiums, color: "border-red-500" },
        ].map(card => (
            <StatsCard key={card.title} title={card.title} value={card.value} color={card.color} />
        ))}
    </div>
  );
};

export default StatsRow;
