"use client";

import { showErrorMessage, showSuccessMessage } from "@/lib/helper";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const isSessionActive = localStorage.getItem("activeAttendanceSession") === "true";
  if (isSessionActive) {
    showErrorMessage("Cannot logout during an attendance session!");
    router.replace("/dashboard/teacher");
    return;
  }
    localStorage.removeItem("teacherId");
    showSuccessMessage("Teacher Logged out!")
    router.replace("/auth/login");
  }, [router]);

  return null;
};

export default Logout;
