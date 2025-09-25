"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
} from "@/lib/helper";

export default function FirstLoginModal({
  studentId,
  onSuccess,
}: {
  studentId: string;
  onSuccess: (newAvatarUrl: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showErrorMessage("Please select an image to upload.");
      return;
    }

    setIsLoading(true);
    showLoadingMessage("Verifying your image...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", studentId);

    try {
      const response = await fetch("/api/upload/student-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      showSuccessMessage("Profile picture updated successfully!");
      onSuccess(data.url);
    } catch (err: any) {
      showErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 flex backdrop-blur-md justify-center items-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-cyan-700 p-8 rounded-2xl shadow-2xl w-full max-w-md text-white text-center"
        >
          {/* Header */}
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Welcome to{" "}
            <span className="text-white uppercase">
              Classify<span className="text-cyan-500">AI</span>
            </span>
          </h1>
          <p className="mt-3 text-gray-400 text-sm">
            Before you continue, please upload a clear photo of your face for
            verification and personalization.
          </p>

          {/* Avatar Preview */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div
              className={`w-40 h-40 rounded-full flex items-center justify-center overflow-hidden border-4 transition-all ${
                preview
                  ? "border-cyan-400 ring-2 ring-teal-400"
                  : "border-gray-700"
              }`}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">Image Preview</span>
              )}
            </div>

            {/* Upload Input */}
            <input
              id="avatar-upload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="avatar-upload"
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold py-2 px-6 rounded-lg cursor-pointer transition-all shadow-md hover:shadow-lg"
            >
              Choose Image
            </label>

            {/* Action Button */}
            <button
              onClick={handleUpload}
              disabled={isLoading || !file}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                "Save Profile Picture"
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
