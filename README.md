# 🎓 Classify AI 

> **A Next-Generation, AI-Powered Campus Management Desktop Application**

Classify AI is a comprehensive, highly secure, and intelligent Enterprise Resource Planning (ERP) platform built for modern educational institutions. Designed as a high-performance **Desktop App using Next.js and Tauri**, it bridges the gap between administrators, teachers, and students with cutting-edge technologies like **Geo-fenced Facial Recognition**, **AI Study Planners**, and **Multi-tier Role-Based Access Control (RBAC)**.

---

## ✨ Why Classify AI?
Traditional LMS platforms are outdated, easy to bypass, and run as slow web apps. Classify AI introduces **Zero-Proxy Attendance** using Geolocation and Face Verification, running natively on your machine. It actively improves student productivity through AI-generated roadmaps and gives teachers powerful analytics to track progress.

---

## 🚀 Core Features by Role

### 👨‍🎓 1. Student Portal (Standard & Premium)
* **Zero-Proxy Attendance:** Secure attendance marking verified via device Geolocation and Facial Recognition.
* **Smart Dashboard:** Real-time overview of today’s attendance, upcoming exams, and interactive calendar (events, holidays, exams).
* **Assignment Hub:** Seamlessly submit text or files (PDFs/Images via Cloudinary), track grading status, and handle "Late Submissions" gracefully.
* **Instant Notifications:** Stay updated with push notifications for every campus announcement.
* **👑 Premium Features:** * **Bunk Manager:** Intelligently manage your attendance and calculate how many classes you can afford to miss.
  * **AI Study Planner:** Auto-generate personalized weekly or semester-wise study roadmaps based on your syllabus.
  * **AI Assistant:** A dedicated AI chatbot for resolving academic queries.

### 👨‍🏫 2. Teacher Portal
* **Advanced Analytics:** Track assignment submission rates and identify defaulting students instantly.
* **Attendance Tracking & Automated Warnings:** Monitor student attendance graphs and send one-click warning emails to students with low attendance.
* **Class Schedule:** Real-time daily timetable mapping with exact lecture timings.
* **Resource Management:** Distribute study materials, books, and campus-wide or section-specific announcements.

### 🛡️ 3. Assistant Portal (Campus Managers)
* **Secure Onboarding:** Add and verify new teachers and students via secure email authentication.
* **Operational Control:** Manage campus announcements, update the academic calendar, and schedule upcoming exams.
* **Audit Logs:** Maintain comprehensive system logs tracking logins, assignment uploads, and announcement publications for ultimate accountability.

### 👑 4. Admin Portal
* **Global Oversight:** The master control panel to create and assign Campus Assistants across multiple registered institutions on the Classify AI network.

---

## 🛠️ Tech Stack & Architecture

Classify AI is built to be a lightning-fast, secure native desktop application.

* **Frontend Framework:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Desktop Runtime:** Tauri (Rust-based, ultra-lightweight and secure)
* **Backend:** Next.js API Routes (Serverless)
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Storage & Media:** Cloudinary (Secure PDF/Image hosting)
* **Notifications & Auth:** Firebase Cloud Messaging (FCM), Custom JWT Auth + Face/Geo Verification

---

## ⚙️ Getting Started (Local Development)

### Prerequisites
Before you begin, ensure you have the following installed:
* **Node.js** (v16 or higher)
* **Rust & Cargo** (Required for Tauri backend compilation)
* OS-specific dependencies for Tauri (e.g., `build-essential`, `webkit2gtk` for Linux)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/classify-ai.git](https://github.com/your-username/classify-ai.git)
   cd classify-ai
   
2. **Install frontend dependencies:**
   ```bash
   npm install
      
3. **Set up Environment Variables:** <br> Create a `.env` file in the root directory and configure your credentials:
   ```code snippet
   DATABASE_URL="postgresql://user:password@localhost:5432/classify_ai"
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your_preset"
   # Add your Firebase Admin and Auth keys here
   
4. **Run Prisma Migrations:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
      
5. **Start the Tauri Desktop App:**
   ```bash
   npm run tauri dev

_This command will start the Next.js frontend and compile the Rust backend, opening the Classify AI native desktop window._

---
## 🔮 Future Roadmap
* **[ ] Real-Time Campus Chat:** A secure, instant messaging system for student-teacher communication.
* **[ ] Custom LLM Integration:** Deploying a personalized, locally-aware AI model trained specifically on campus data to provide hyper-contextual assistance.
---
 <u>_Built with ❤️ for modern education._</u>
