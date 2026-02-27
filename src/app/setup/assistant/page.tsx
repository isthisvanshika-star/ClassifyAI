"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showErrorMessage, showLoadingMessage, showSuccessMessage, toastDissmisser } from "@/lib/helper";

export default function AdminSetupPage() {
  const router = useRouter();
  // 1. ADD 'hindiName' to the form state
  const [formData, setFormData] = useState({
    name: "",
    hindiName: "",
    city: "",
    latitude: "",
    longitude: "",
    wifiBssids: "",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assistantId, setAssistantId] = useState<string | null>(null);

  useEffect(() => {
    const storedAssistantId = localStorage.getItem('assistantId');
    if (storedAssistantId) {
      setAssistantId(storedAssistantId);
    } else {
      showErrorMessage("No assistant ID found. Please log in again.");
      router.push('/auth/login');
    }
  },[assistantId])


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    let toastID = showLoadingMessage("Uploading logo...");
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await fetch("/api/upload/campus-logo", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await response.json();
      toastDissmisser(toastID);

      if (!response.ok) throw new Error(data.error || "Upload failed");

      setLogoUrl(data.url);
      showSuccessMessage("Logo uploaded successfully!");
    } catch (err: any) {
      toastDissmisser(toastID);
      showErrorMessage(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
   let toastID= showLoadingMessage("Saving college details...");

    try {
      // 3. 'hindiName' is now automatically included in the payload via the spread operator
      const payload = {
        ...formData,
        assistantId,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        wifiBssids: formData.wifiBssids
          .split(",")
          .map((bssid) => bssid.trim())
          .filter(Boolean),
        logoUrl,
      };

      const response = await fetch("/api/campus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      toastDissmisser(toastID);

      if (!response.ok) {
        const errorMessage =
          data.error?.[0]?.message || data.error || "Failed to save details.";
        throw new Error(errorMessage);
      }
      localStorage.setItem("CampusID", data.id)
      showSuccessMessage("College registered successfully! Login Again...");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      toastDissmisser(toastID);
      showErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isUploading || isSubmitting;

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-800 to-indigo-950 p-6">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl text-white">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
          Welcome, ASSISTANT
        </h1>
        <p className="text-gray-400 mb-6">
          Let’s set up your college to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full College Name"
              autoComplete="off"
              required
              className="bg-gray-800/60 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
            />
            {/* 2. ADDED INPUT FIELD FOR HINDI NAME */}
            <input
              name="hindiName"
              value={formData.hindiName}
              onChange={handleInputChange}
              placeholder="Full College Name (in Hindi)"
              autoComplete="off"
              className="bg-gray-800/60 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              autoComplete="off"
              required
              className="bg-gray-800/60 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="College Latitude (e.g., 24.5854)"
              autoComplete="off"
              required
              className="bg-gray-800/60 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
            />
            <input
              name="longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="College Longitude (e.g., 73.7125)"
              autoComplete="off"
              required
              className="bg-gray-800/60 border border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="logo"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              College Logo
            </label>
            <input
              id="logo"
              type="file"
              onChange={handleLogoUpload}
              accept="image/png, image/jpeg"  
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo Preview"
                className="w-20 h-20 mt-3 object-contain rounded-md bg-gray-800 p-2 border border-gray-700"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="wifiBssids"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Whitelisted Wi-Fi BSSIDs (Optional)
            </label>
            <textarea
              name="wifiBssids"
              value={formData.wifiBssids}
              onChange={handleInputChange}
              placeholder="Enter comma-separated BSSIDs, e.g., AA:BB:CC:11:22:33, DD:EE:FF:44:55:66"
              rows={3}
              className="bg-gray-800/60 border border-gray-600 p-3 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:bg-gray-600 disabled:hover:scale-100"
          >
            {isSubmitting
              ? "Saving..."
              : isUploading
              ? "Waiting for upload..."
              : "Complete Setup"}
          </button>
        </form>
      </div>
    </main>
  );
}
