"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation';
import React from 'react'

const SideButtons = ({faIcon, title, link}: {faIcon: any, title: string, link: string}) => {
    const router = useRouter();
  return (
    <button
  onClick={() => router.push(link)}
  className="group relative flex items-center gap-3 px-5 py-2.5 rounded-xl 
  bg-white/5 border border-white/10 backdrop-blur-md
  hover:bg-white/10 hover:border-cyan-400/40
  transition-all duration-200 hover:scale-[1.03]"
>
  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 blur-md transition" />
  <FontAwesomeIcon
    icon={faIcon}
    className="h-5 w-5 text-cyan-300 group-hover:text-cyan-200 transition"
  />
  <span className="text-sm font-medium text-gray-200 group-hover:text-white">
    {title}
  </span>
</button>
  )
}

export default SideButtons