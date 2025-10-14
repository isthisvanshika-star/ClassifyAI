"use client";
import React, { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

interface AttendancePercentage {
  subject: string;
  percentage: number;
}

const BarGraph: React.FC = () => {
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendancePercentage[]>(
    []
  );

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const campusID = localStorage.getItem("CampusID");
    if (!studentId || !campusID) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/attendance/percentage?studentId=${studentId}&campusId=${campusID}`
        );
        const result: AttendancePercentage[] = await res.json();

        // Ensure percentage is a rounded number
        const formatted = result.map((item) => ({
          subject: item.subject,
          percentage: Math.round(Number(item.percentage)),
        }));

        setAttendanceData(formatted);
      } catch (err) {
        console.error("Error loading attendance graph data:", err);
      }
    };

    fetchData();
  }, []);

  const maxValue = Math.max(
    ...attendanceData.map((item) => item.percentage),
    0
  );
  const total = attendanceData.reduce((acc, item) => acc + item.percentage, 0);
  const average = attendanceData.length
    ? Math.round(total / attendanceData.length)
    : 0;

  const handleClick = (index: number) => {
    setSelectedBar(selectedBar === index ? null : index);
  };

  return (
    <div className="mx-7 bg-gradient-to-tl from-white/20 to-black/20 rounded-4xl 2xl:w-[40rem] 2xl:h-[30rem] lg:-ml-0 lg:w-[24rem] md:w-[42rem] sm:w-[35rem] shadow-xl border border-cyan-200 overflow-hidden w-100 ">
      {/* Header */}
      <div className="bg-black/40 text-white p-2">
        <div className="flex items-center gap-6">
          <div className="p-1 sm:ml-3 lg:ml-3 bg-white/5 2xl:text-2xl rounded-lg">
            <BarChart3 size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold 2xl:text-xl ">
              Attendance Percentage by Subject
            </h2>
            <p className="text-slate-200 text-xs 2xl:text-base">
              Track your consistency per subject
            </p>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className=" px-3 h-[160px] md:h-[15rem] lg:w-[22.7rem]  sm:h-[12rem]  w-92">
        <div className="bg-gray-50/5 rounded-lg p-1 md:w-[40.5rem] 2xl:w-[38.4rem] 2xl:h-[22.5rem] lg:w-[22.5rem] md:h-[12rem] sm:w-[33.5rem] sm:h-[9rem] w-92">
          <div className="flex items-end justify-between gap-1 h-26  2xl:h-89 rounded-md p-2 shadow-inner overflow-x-auto">
            {attendanceData.map((item, index) => {
              const value = item.percentage;
              const height = Math.max((value / 100) * 300, 6);
              const isSelected = selectedBar === index;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 min-w-[20px] 2xl:min-w-[30px]  group cursor-pointer"
                  onClick={() => handleClick(index)}
                >
                  {/* Tooltip */}
                  <div className=" opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 text-black text-[8px] p-1 rounded whitespace-nowrap">
                    {value}%
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full max-h-18 2xl:max-w-10 2xl:max-h-[30rem]  max-w-5  rounded-t-md shadow-md relative overflow-hidden transition-all duration-300 bg-cyan-500"
                    style={{ height: `${height}px` }}
                  >
                    {isSelected && (
                      <div
                        className="absolute inset-0 opacity-50"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 4px,
                            rgba(255,255,255,0.8) 4px,
                            rgba(255,255,255,0.8) 8px
                          )`,
                        }}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <div
                    className={` text-[9px] 2xl:text-sm font-medium ${
                      isSelected ? "text-cyan-300 font-bold" : "text-gray-200"
                    }`}
                  >
                    {item.subject}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Panel */}
        {selectedBar !== null && attendanceData[selectedBar] !== undefined ? (
          <div className="mt-2 w-92 2xl:w-[38rem] 2xl:text-sm  p-1 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg border border-blue-200 text-[10px] text-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <h3 className="font-semibold">
                  {attendanceData[selectedBar].subject} Details:
                </h3>
                <p>
                  Attendance:{" "}
                  <span className="font-bold text-cyan-300">
                    {attendanceData[selectedBar].percentage}%
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p>
                  {attendanceData[selectedBar].percentage >= average
                    ? "Above"
                    : "Below"}{" "}
                  average
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex mt-2 gap-2 sm:w-[33rem] 2xl:w-[38rem] 2xl:text-sm md:w-[40.5rem] lg:w-[22rem] w-92 p-1 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg border border-blue-200 text-xs text-gray-200">
            <h4 className="font-semibold">Instructions:</h4>
            <p>Click on any bar to watch detailed information.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarGraph;
