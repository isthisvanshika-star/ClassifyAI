"use client";
import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react'

const TrendIndicator = ({
  value,
  threshold,
}: {
  value: number;
  threshold: number;
}) => {
      const isGood = value >= threshold;
  return (
   <div className="flex items-center gap-1 mt-1">
      {isGood ? (
        <>
          <TrendingUp size={14} className="text-green-400" />
          <span className="text-xs text-green-400">Good</span>
        </>
      ) : (
        <>
          <TrendingDown size={14} className="text-red-400" />
          <span className="text-xs text-red-400">Low</span>
        </>
      )}
    </div>
  )
}

export default TrendIndicator