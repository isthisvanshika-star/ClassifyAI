"use client";
import { NumberCardsProps } from '@/lib/types';
import React from 'react'

const NumberCard:React.FC<NumberCardsProps> = (props) => {
  return (
    <div className='flex mt-4 lg:w-40 lg:-ml-5 lg:h-20 2xl:w-60 sm:w-60 2xl:h-40 2xl:my-0 sm:h-40 flex-col items-center justify-center bg-gradient-to-tl from-white/20 to-black/20 border border-cyan-300 w-[12rem] rounded-4xl'  >
         <h1 className='text-2xl sm:text-4xl text-center lg:text-lg 2xl:text-4xl text-cyan-300'>{props.value}</h1>
         <p className='text-base sm:text-lg text-center lg:text-sm 2xl:text-2xl text-cyan-100 '>{props.title}</p>
      </div>
  )
}

export default NumberCard