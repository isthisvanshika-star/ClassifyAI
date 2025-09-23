"use client";
import React, { useEffect, useState } from "react";
import { SDetails } from "@/lib/types";
import { numberToRoman } from "@/lib/helper";
const Greeting = () => {
  const [details, setDetails] = useState<SDetails | null>(null);
  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      console.error("No student ID found in local storage.");
      return;
    }

    const fetchStudentDetails = async () => {
      try {
        const res = await fetch(`/api/student/details?studentId=${studentId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch student details");
        }
        const data = await res.json();
        setDetails(data);
        console.log({ details: data });
      } catch (error) {
        console.log("Error fetching student details:", error);
      }
    };

    fetchStudentDetails();
  }, []);
  function removeMiddleName(fullName: string): string {
  // Split the name by one or more spaces
  const parts: string[] = fullName.trim().split(/\s+/);

  // If there's no middle name, return as is
  if (parts.length <= 2) {
    return fullName;
  }

  // Return only first and last name
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

  return (
    <div className="sm:flex 2xl:ml-2 lg:flex lg:pl-5 lg:space-y-2 lg:mt-10 sm:flex-col sm:gap-1 sm:p-1 sm:w-sm">
      <h1 className="sm:text-lg lg:text-start lg:text-2xl  sm:text-center 2xl:text-4xl"> WELCOME BACK!</h1>
      <strong className="sm:capitalize lg:text-start sm:text-base sm:text-center 2xl:text-4xl lg:text-2xl ">{removeMiddleName(details?.name||"")}</strong>
      <div className="sm:flex sm:gap-3 lg:text-base sm:w-sm lg:ml-0 sm:ml-[84px] 2xl:text-2xl">
        {details?.branch && (
          <span className="sm:text-center">
            <strong className="sm:text-center">Branch: </strong>
            {details?.branch}
          </span>
        )}
        {details?.year && (
          <span className="sm:text-center">
            <strong className="sm:text-center">Year: </strong>
            {numberToRoman(details?.year || 0) || details?.year}
          </span>
        )}
        {details?.semester && (
          <span className="sm:text-center">
            <strong className="sm:text-center">Sem: </strong>
            {numberToRoman(details?.semester || 0) || details?.semester}
          </span>
        )}
      </div>
    </div>
  );
};

export default Greeting;
