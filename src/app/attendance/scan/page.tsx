"use client";

import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentLocation, showErrorMessage, showLoadingMessage, showSuccessMessage } from "@/lib/helper";
import { get } from "http";

const ScanPage = () => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannedRef = useRef(false);
  const router = useRouter();

  // ==================== THIS IS THE CORRECTED FUNCTION ====================
  const handleScan = async (decodedText: string) => {
    if (scannedRef.current) {
      return;
    }
    scannedRef.current = true;
    showLoadingMessage("QR Code detected, getting your location...");

    let qrData;
    try {
      qrData = JSON.parse(decodedText);
      if (!qrData.token) {
        throw new Error("Invalid QR: No token found.");
      }
    } catch (e: any) {
      showErrorMessage(e.message || "Invalid QR code format");
      scannedRef.current = false; // Allow rescanning
      return;
    }

    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }

    try {
      // FIX 1: Get the logged-in student's user ID from local storage.
      const loggedInStudentId = localStorage.getItem("studentId");
      if (!loggedInStudentId) {
        throw new Error("Login error: Could not find your student ID.");
      }

      //2. Call the location helper function.
      const location = await getCurrentLocation();
      showLoadingMessage("Location found, Verifying attendance...")
      
      // FIX 2: Send the correct data to the correct API endpoint.
      const res = await fetch(`/api/attendance/mark`, { // Corrected URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, 
        body: JSON.stringify({
          token: qrData.token,          // The token from the QR code
          studentId: loggedInStudentId, // The ID of the student who is scanning
          location: location,
          wifibssid: null, // Optional: Add WiFi BSSID if needed///NEEDED TO BE FETCHED FROM RUST API....
        }),
      });

      const result = await res.json();

      if (res.ok) {
        showSuccessMessage(result.message || "Attendance Recorded!");
        setTimeout(() => {
          router.replace("/dashboard/student");
        }, 1500);
      } else {
        showErrorMessage(result.message || "Failed marking attendance");
        scannedRef.current = false; // Allow rescanning on API error
      }
    } catch (error: any) {
      showErrorMessage(error.message || "Error marking attendance");
      scannedRef.current = false; // Allow rescanning on fetch error
    }
  };
  // =======================================================================

  useEffect(() => {
    const observeButtons = () => {
      const observer = new MutationObserver(() => {
        const buttons =
          document.querySelectorAll<HTMLButtonElement>(
            "#reader .html5-qrcode-scanner button"
          );
        buttons.forEach((button) => {
          button.removeAttribute("style");
          button.style.backgroundColor = "red";
          button.style.color = "#06b6d4";
          button.style.border = "1px solid #06b6d4";
          button.style.padding = "0.5rem 1rem";
          button.style.margin = "0.25rem";
          button.style.borderRadius = "0.375rem";
          button.style.cursor = "pointer";
          button.style.transition = "background-color 0.2s ease-in-out";
        });
      });

      const readerElem = document.getElementById("reader");
      if (readerElem) {
        observer.observe(readerElem, {
          childList: true,
          subtree: true,
        });
      }

      return () => observer.disconnect();
    };

    const setupScanner = () => {
      const readerElem = document.getElementById("reader");
      if (readerElem) {
        readerElem.innerHTML = "";
      }

      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 550 },
        false
      );

      scanner.render(handleScan, (err) => {
      });

      scannerRef.current = scanner;
    };

    const disconnectObserver = observeButtons();

    const timeout = setTimeout(setupScanner, 300);

    return () => {
      disconnectObserver();

      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .then(() => {
            const el = document.getElementById("reader");
            if (el) el.innerHTML = "";
            scannerRef.current = null;
          })
          .catch((err) => {
            const el = document.getElementById("reader");
            if (el) el.innerHTML = "";
            scannerRef.current = null;
          });
      }

      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center gap-40 bg-gradient-to-br from-gray-900/15 via-black/15 to-gray-800/15 text-white p-6 flex-col">
      <h2 className="text-center text-3xl uppercase text-cyan-200">
        Scan QR to mark Attendance
      </h2>
      <div
        id="reader"
        className="w-full max-w-3xl max-h-[40rem] mx-auto"
      ></div>
        {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center gap-2 rounded-full text-white hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft size={40} /> Back
        </button>
      </div>
    </div>
  );
};

export default ScanPage;