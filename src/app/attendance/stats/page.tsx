"use client";
import { BunkStats } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { showSuccessMessage } from "@/lib/helper";

const Page = () => {
  const [stats, setStats] = useState<BunkStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const campusId = localStorage.getItem("CampusID");
    if (!studentId || !campusId) {
      setError("Student or Campus ID not found.");
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch(
          `/api/attendance/bunk-manager?studentId=${studentId}&campusId=${campusId}`
        );
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          setError("Failed to fetch bunk manager stats.");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = stats.map((item) => ({
    subject: item.subject,
    percentage: parseFloat(item.percentage.toFixed(2)),
  }));

  const downloadReport = async () => {
    const node = document.getElementById("bunk-report");
    if (!node) return;

    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const ratio = img.height / img.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, pageWidth * ratio);

      pdf.save("BunkReport.pdf");
      showSuccessMessage("Report downloaded successfully.");
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  return (
    <div id="bunk-report" className="w-full h-screen overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center gap-2 rounded-full text-white hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft size={40} /> Back
        </button>
      </div>

      <h1 className="text-4xl sm:text-5xl animated-gradient font-extrabold text-center py-8">
        Bunk Manager
      </h1>

      {loading && (
        <p className="text-cyan-100 animate-pulse text-center">
          Loading statistics...
        </p>
      )}
      {error && <p className="text-red-400 text-center font-medium">{error}</p>}

      {!loading && !error && stats.length === 0 && (
        <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-10rem)] gap-4">
          <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border border-cyan-500/30">
            <span className="text-5xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-cyan-200">
            No Statistics Available
          </h2>
          <p className="text-gray-400 text-center max-w-md">
            We couldn’t find any attendance records for you yet. Once your
            classes and attendance data are updated, your bunk stats will appear
            here.
          </p>
          <button
            onClick={() => router.push("/dashboard/student")}
            className="px-6 py-2 mt-4 cursor-pointer outline-none bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow transition"
          >
            Go Back
          </button>
        </div>
      )}

      { !loading && !error && stats.length > 0  && <div className="flex h-[calc(100vh-10rem)] px-6 gap-6">
        {/* Left: Scrollable Cards */}
        <div className="w-md overflow-y-auto pr-2 space-y-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-lg shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all duration-300"
            >
              <h2 className="text-xl font-bold text-cyan-200">
                {item.subject}
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Total: <span className="font-medium">{item.total}</span> |
                Present: <span className="font-medium">{item.present}</span>
              </p>
              <div className="flex justify-between items-end mt-4">
                <p
                  className={`text-lg font-semibold ${
                    item.percentage > 75 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {item.percentage.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-200">
                  Safe Bunks:{" "}
                  <span className="text-yellow-400 font-semibold">
                    {item.safeBunks}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Section */}
        <div className="w-2/3 flex flex-col overflow-y-auto pb-6 justify-start space-y-3 items-center ">
          {/* Chart */}
          {!loading && stats.length > 0 && (
            <div className="bg-white/5 p-6 rounded-2xl max-w-xl border border-cyan-100/10 shadow-md backdrop-blur-md">
              <h2 className="text-2xl font-bold text-cyan-200 mb-4">
                Attendance Overview
              </h2>
              <ResponsiveContainer width="101%" height={285}>
                <LineChart data={chartData}>
                  <XAxis dataKey="subject" stroke="#94a3b8" strokeWidth={2} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#38bdf8" }}
                    itemStyle={{ color: "#facc15" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#06b6d4"
                    strokeWidth={0.5}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bunk Planner */}
          <div className="bg-white/5 p-6 rounded-2xl border border-cyan-100/10 shadow-md backdrop-blur-md w-[37rem] overflow-hidden">
            <h2 className="text-2xl font-bold text-cyan-200 mb-4">
              Bunk Planner
            </h2>
            <p className="text-gray-300 text-lg mb-2">
              Check how many more classes you can bunk:
            </p>
            {stats.map((item, idx) => {
              const maxAllowed = Math.floor(item.total * 0.25);
              const remaining = maxAllowed - (item.total - item.present);
              return (
                <div key={idx} className="mb-3">
                  <h3 className="text-lg text-cyan-100 font-semibold">
                    {item.subject}
                  </h3>
                  <p className="text-sm text-gray-300">
                    You can bunk{" "}
                    <span className="text-yellow-300 font-bold">
                      {Math.max(remaining, 0)}
                    </span>{" "}
                    more lecture(s) without falling below 75%.
                  </p>
                </div>
              );
            })}
            <div className="flex justify-end mt-6">
              <button
                onClick={downloadReport}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 transition text-white font-semibold rounded-full"
              >
                Download Attendance Report
              </button>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default Page;
