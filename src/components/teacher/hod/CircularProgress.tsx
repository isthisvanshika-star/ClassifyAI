"use client";
import React from 'react'

const CircularProgress = ({ value }: { value: number }) => {
      const radius = 30;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (value / 100) * circumference;

  return (
     <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="rgba(255,255,255,0.2)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="white"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  )
}

export default CircularProgress