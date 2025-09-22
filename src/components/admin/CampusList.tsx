"use client";

import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";

// A simple fetcher function for useSWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Define a type for the campus data
type Campus = {
  id: string;
  name: string;
  city: string;
  logoUrl?: string | null;
};

export default function CampusList() {
  // useSWR handles fetching, caching, loading, and error states automatically
  const { data: campuses, error, isLoading } = useSWR<Campus[]>('/api/campus', fetcher);

  console.log(campuses)
  console.log(error)

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="w-6 h-6 border-4 border-dashed rounded-full animate-spin border-indigo-400 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-400">Loading Campuses...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-center">Failed to load campus list.</p>;
  }

  if (!campuses || campuses.length === 0) {
    return <p className="text-gray-400 text-center">No campuses have been created yet.</p>;
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {campuses.map((campus) => (
        <div 
          key={campus.id} 
          className="bg-gray-800 p-4 rounded-lg flex items-center justify-between hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <Image
              src={campus.logoUrl || "/only-logo.png"} // Fallback to a default logo
              alt={`${campus.name} Logo`}
              width={40}
              height={40}
              className="rounded-full bg-gray-600 object-contain"
            />
            <div>
              <p className="font-semibold text-white">{campus.name}</p>
              <p className="text-sm text-gray-400">{campus.city}</p>
            </div>
          </div>
          {/* This button can later link to a detailed management page */}
          <Link href={`/admin/campuses/${campus.id}`}>
            <div className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded-md cursor-pointer">
              Manage
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}