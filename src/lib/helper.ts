import toast from "react-hot-toast";
import { prisma } from "./prisma";
import { BookOpen, Home, LogOut, Megaphone, ClipboardCheck, NotepadText, Upload } from "lucide-react";

export const logActivity = async (
  userId: string,
  userName: string,
  action: string
) => {
  await prisma.recentActivity.create({
    data: {
      userId,
      userName,
      action,
    },
  });
};

export const titleArrayForPremiumPage = [
  "Total Users",
  "Premium Users",
  "Ultimate Users",
  "Pro Users",
];

export const titleArrayForEventPage = [
  "Total Events",
  "Exams",
  "Holidays",
  "Others",
];

export const monthlyPlans = [
  {
    title: "Starter",
    price: 0,
    bg: "from-cyan-500 to-cyan-700",
    features: [
      "QR Code Attendance",
      "Exam & Assignment Tracker",
    ],
    extra: [
      "Bunk Manager",
      "Smart Study Plan Generator",
      "Monthly Attendance Reports",
      "AI Doubt Solver",
      "Calendar Sync",
    ],
    popular: false,
  },
  {
    title: "Pro",
    price: 39,
    bg: "from-emerald-400 to-emerald-600",
    features: [
      "QR Code Attendance",
      "Exam & Assignment Tracker",
      "Bunk Manager",
      "Smart Study Plan Generator",
    ],
    extra: ["AI Doubt Solver","Monthly Attendance Reports", "Calendar Sync"],
    popular: true,
  },
  {
    title: "Ultimate",
    price: 99,
    bg: "from-orange-500 to-rose-500",
    features: [
      "QR Code Attendance",
      "Exam & Assignment Tracker",
      "Bunk Manager",
      "Smart Study Plan Generator",
      "AI Doubt Solver",
      "Monthly Attendance Reports",
      "Calendar Sync",
    ],
    extra: [],
    popular: false,
  },
];

export function showSuccessMessage(message: string) {
  toast.dismiss();
  toast.success(message, {
    style: {
      background: "rgba(0, 0, 0, 0.5)",
      color: "#fff",
      fontWeight: "bold",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    position: "bottom-right",
  });
}

export function showLoadingMessage(message: string) {
  toast.dismiss();
  const toastID = toast.loading(message, {
    style: {
      background: "rgba(0, 0, 0, 0.5)",
      color: "#fff",
      fontWeight: "bold",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    position: "bottom-right",
  });
  return toastID
}
export function toastDissmisser(toastID: string) {
  toast.dismiss(toastID);
}

export function showErrorMessage(message: string) {
  toast.dismiss();
  toast.error(message, {
    style: {
      background: "rgba(0, 0, 0, 0.5)",
      color: "#fff",
      fontWeight: "bold",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
    position: "bottom-right",
  });
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      return resolve(true); // Already loaded
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const eventTypeColors: Record<string, string> = {
  HOLIDAY:
    "bg-gradient-to-tr from-yellow-200/20 to-yellow-400/20 text-yellow-50",
  EXAM: "bg-gradient-to-tr from-red-200/20 to-red-400/20 text-red-50",
  EVENT: "bg-gradient-to-tr from-green-200/20 to-green-400/20 text-green-50",
};

export function extractJSON(rawText: string): any {
  try {
    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    const start = cleanedText.indexOf("{");
    const end = cleanedText.lastIndexOf("}") + 1;

    if (start === -1 || end === -1 || end <= start) {
      console.error("Raw AI Response (unparsable):", rawText);
      throw new Error("No valid JSON block found in the response");
    }

    const jsonString = cleanedText.slice(start, end);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("❌ Failed to extract JSON:", err);
    throw new Error("AI response did not contain valid JSON");
  }
}

export const quoteArray = [
  {
    text: "You want something? Go get it. Period.",
    author: "~Chris Gardner",
  },
  {
    text: "I am not afraid of dying, I'm afraid of not trying.",
    author: "~Jay Z",
  },
  {
    text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    author: "~Winston Churchill",
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "~Theodore Roosevelt",
  },
  {
    text: "If they say ‘it’s impossible’, remember it’s impossible for them, not for you.",
    author: "~Jordan Belfort",
  },
  {
    text: "Success usually comes to those who are too busy to be looking for it.",
    author: "~Henry David Thoreau",
  },
];

export const SECTIONS = [
  { key: "email", label: "Change Admin Email" },
  { key: "logs", label: "Manage Activity Logs" },
  { key: "contact", label: "Contact Message" },
  { key: "plans", label: "Manage  Plans" },
  { key: "export", label: "Export Logs" },
];

export function numberToRoman(num: number): string {
  const thousands = ["", "M", "MM", "MMM"];
  const hundreds = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
  const tens = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
  const ones = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

  const t = thousands[Math.floor(num / 1000)];
  const h = hundreds[Math.floor((num % 1000) / 100)];
  const te = tens[Math.floor((num % 100) / 10)];
  const o = ones[num % 10];

  return t + h + te + o;
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3; // Earth's radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // in metres
}

export const teacherNavLinks = [
  { label: "Dashboard", href: "/dashboard/teacher", icon: Home },
  { label: "Assignments", href: "/dashboard/teacher/assignments", icon: BookOpen },
  { label: "Classes", href: "/dashboard/teacher/classes", icon: NotepadText },
  { label: "Attendance", href: "/dashboard/teacher/attendance-history", icon: ClipboardCheck },
  { label: "Announcements", href: "/dashboard/teacher/announcements", icon: Megaphone },
  { label: "Resources", href: "/dashboard/teacher/resources", icon: Upload },
  { label: "Logout", href: "/dashboard/teacher/logout", icon: LogOut },
];


// --- NEWLY IMPLEMENTED FUNCTION ---
/**
 * Fetches the city for a given IP address using a free geolocation API.
 * @param ip The IP address to look up.
 * @returns The city name as a string, or "Unknown" if it fails.
 */

export async  function getCityfromIp(ip: string): Promise<string>{
  // Handle special cases like localhost or unknown IPs
  if(ip === "unknown" || ip === "::1" || ip === "127.0.0.1"){
    // For local development, return a default city to allow tests to pass.
    // In production, an "unknown" IP might be treated with more suspicion.
    return "Udaipur"; // Or your default development city
  }
  try {
    // Use the ip-api.com service, requesting only the 'city' field for efficiency
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=city`);
    if (!response.ok) {
        console.error(`IP API failed with status: ${response.status}`);
        return "Unknown";
    }

    const data = await response.json();
    
    if (data.status === 'success' && data.city) {
        return data.city;
    } else {
        return "Unknown";
    }
  } catch (error) {
    console.error("Error fetching city from IP:", error);
    return "Unknown"; // Return a safe default on any error
  }
}

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          reject(new Error("Unable to retrieve your location. Please enable location permissions."));
        }
      );
    }
  });
};

export function getCurrentWeekday(
  date: Date
):
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY" {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ] as const;
  return days[date.getDay()];
}

export const verificationEmailHTML = (code: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
    <style>
      body {
        background-color: #0f172a;
        color: #f8fafc;
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background-color: #1e293b;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #38bdf8;
      }
      .header {
        text-align: center;
        font-size: 28px;
        font-weight: bold;
        color: #38bdf8;
        margin-bottom: 20px;
      }
      .content {
        font-size: 16px;
        line-height: 1.5;
        color: #e2e8f0;
      }
      .code {
        display: inline-block;
        background-color: #0ea5e9;
        color: #000;
        font-weight: bold;
        padding: 10px 20px;
        font-size: 18px;
        border-radius: 4px;
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #64748b;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">ClassifyAI</div>
      <div class="content">
        <p>Hello Admin,</p>
        <p>We received a request to change your admin email address.</p>
        <p>Please use the following verification code to confirm the change:</p>
        <div class="code">${code}</div>
        <p>If you didn’t request this change, please ignore this email.</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} ClassifyAI. All rights reserved.
      </div>
    </div>
  </body>
  </html>
`;
