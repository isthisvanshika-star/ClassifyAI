"use client";

import React, { use } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id: campusId } = use(params);

  // 🔥 Dashboard Data
  const { data: dashboard, isLoading: loadingDashboard } = useSWR(
    `/api/admin/campus/${campusId}/dashboard`,
    fetcher
  );

  // 🔥 Campus Details
  const { data: campus } = useSWR(
    `/api/admin/campus/${campusId}`,
    fetcher
  );

  // 🔥 Extra Data (optional but useful)
  const { data: students } = useSWR(
    `/api/admin/campus/student?campusId=${campusId}`,
    fetcher
  );

  const { data: teachers } = useSWR(
    `/api/admin/campus/teacher?campusId=${campusId}`,
    fetcher
  );

  const { data: subjects } = useSWR(
    `/api/admin/campus/subject?campusId=${campusId}`,
    fetcher
  );

  return (
    <div className="relative min-h-screen text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-800 to-neutral-950 z-0" />

      {/* Content */}
      <main className="relative z-10 p-6 md:p-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {campus?.name || "Campus Dashboard"}
            </h1>
            <p className="text-sm text-gray-400">
              {campus?.city || "Loading..."} •{" "}
              <span className="text-indigo-400">{campusId}</span>
            </p>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold">
            Edit Campus
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {loadingDashboard ? (
            <p className="text-gray-400">Loading stats...</p>
          ) : (
            [
              { title: "Students", value: dashboard?.students || 0 },
              { title: "Teachers", value: dashboard?.teachers || 0 },
              { title: "Subjects", value: dashboard?.subjects || 0 },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
              >
                <p className="text-sm text-gray-400">{card.title}</p>
                <h2 className="text-2xl font-bold mt-1">
                  {card.value}
                </h2>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-600/20 hover:bg-indigo-600/30 transition p-5 rounded-xl cursor-pointer">
            <h3 className="font-semibold text-lg">Manage Students</h3>
            <p className="text-sm text-gray-300 mt-1">
              Total: {students?.length || 0}
            </p>
          </div>

          <div className="bg-green-600/20 hover:bg-green-600/30 transition p-5 rounded-xl cursor-pointer">
            <h3 className="font-semibold text-lg">Manage Teachers</h3>
            <p className="text-sm text-gray-300 mt-1">
              Total: {teachers?.length || 0}
            </p>
          </div>

          <div className="bg-yellow-600/20 hover:bg-yellow-600/30 transition p-5 rounded-xl cursor-pointer">
            <h3 className="font-semibold text-lg">Subjects</h3>
            <p className="text-sm text-gray-300 mt-1">
              Total: {subjects?.length || 0}
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold text-lg mb-3">Recent Activity</h3>

          {dashboard?.recentActivity?.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recentActivity.map((item: any, i: number) => (
                <div
                  key={i}
                  className="text-sm text-gray-300 border-b border-white/10 pb-2"
                >
                  <span className="text-indigo-400">
                    {item.userName || "User"}
                  </span>{" "}
                  - {item.action}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No recent activity yet...
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;