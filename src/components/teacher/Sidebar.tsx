"use client";

import { teacherNavLinks } from "@/lib/helper";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="2xl:w-30 2xl:ml-32 bg-white/5 h-[40rem] items-center justify-center rounded-full backdrop-blur-lg border border-white/10 p-1 flex flex-col shadow-lg">
      <nav className="flex items-center space-y-10 flex-col">
        {teacherNavLinks.map(({ label, href, icon: Icon }) => (
          <div key={label} className="relative group">
            <Link
              href={href}
              className={`flex items-center justify-center gap-13 px-1 py-1 rounded-full h-10 w-10 transition-all duration-200 
                ${pathname === href 
                  ? "bg-white/20 bg-gradient-to-r from-indigo-400 to-cyan-400 shadow-inner" 
                  : "text-white/80 hover:bg-white/20 hover:text-white"
                }`}
            >
              <Icon size={30} />
            </Link>
            {/* Tooltip */}
            <span className="absolute left-12 top-1/2 z-50 -translate-y-1/2 px-3 py-1 rounded-md bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-200 whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
