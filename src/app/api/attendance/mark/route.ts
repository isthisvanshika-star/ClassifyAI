import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekday, haversineDistance, logActivity } from "@/lib/helper";

// --- CONFIGURATION ---
// Set the maximum number of times a student can mark attendance for one subject in a single day.
const MAX_ATTENDANCE_PER_DAY = 1;

export async function POST(req: Request) {
  try {
    const { token, studentId, location   } = await req.json(); // studentId here is the USER ID of the logged-in student

    if (!token || !studentId) {
      return NextResponse.json({ message: "Missing token or student ID" }, { status: 400 });
    }

    // --- Find the token and the student profile in parallel for efficiency ---
    const [tokenRecord, studentUser] = await Promise.all([
      prisma.attendanceToken.findUnique({
        where: { token },
        include: { subject: { select: { name: true, id: true } } },
      }),
      prisma.user.findUnique({
        where: { id: studentId },
        include: { studentProfile: true },
      }),
    ]);
    
    // --- Initial Validations ---
    if (!tokenRecord) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 404 });
    }
    if (!studentUser || !studentUser.studentProfile) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    const now = new Date();
    if (new Date(tokenRecord.expiresAt).getTime() <= now.getTime()) {
      return NextResponse.json({ message: "Token has expired" }, { status: 410 });
    }
    if (tokenRecord.used) {
        return NextResponse.json({ message: "This QR code has already been used" }, { status: 410 });
    }

    // --- CRITICAL SECURITY CHECK ---
    // Ensure the student ID from the token matches the ID of the student scanning.
    if (tokenRecord.studentId !== studentUser.studentProfile.id) {
        return NextResponse.json({ message: "This QR code is not valid for you." }, { status: 403 });
    }

        // --- DYNAMIC GEOFENCE CHECK (NEW LOGIC) ---
    // Check if the token has location data stored in it.
    if (tokenRecord.latitude && tokenRecord.longitude) {
        if (!location?.latitude || !location?.longitude) {
            return NextResponse.json({ message: "Location data is missing from your request." }, { status: 400 });
        }

        const distance = haversineDistance  (
            tokenRecord.latitude,   // Use location from the token
            tokenRecord.longitude,  // Use location from the token
            location.latitude,      // Student's current location
            location.longitude      // Student's current location
        );

        const allowedRadius = 50; // The 50-meter radius you wanted

        if (distance > allowedRadius) {
            return NextResponse.json({ message: `Attendance failed. You are approximately ${Math.round(distance)} meters away from the required location.` }, { status: 403 });
        }
    }

    // --- CUSTOMIZABLE LIMIT CHECK ---
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const attendanceCount = await prisma.attendance.count({
      where: {
        studentId: studentUser.studentProfile.id,
        markedAt: { gte: startOfDay }, // Check for records created today
        classSession: { subjectId: tokenRecord.subjectId },
      },
    });

    if (attendanceCount >= MAX_ATTENDANCE_PER_DAY) {
      return NextResponse.json({ message: `Attendance limit of ${MAX_ATTENDANCE_PER_DAY} for this subject has been reached today.` }, { status: 409 });
    }

    // --- Find or Create Class Session ---
    const teacherProfile = await prisma.teacher.findUnique({ where: { id: tokenRecord.professorId } });
    if (!teacherProfile) {
        return NextResponse.json({ message: "Could not identify the teacher for this session" }, { status: 404 });
    }
    
    let classSession = await prisma.classSession.findFirst({
        where: {
            subjectId: tokenRecord.subjectId,
            teacherId: teacherProfile.id,
            startTime: { gte: startOfDay }
        },
    });

    if (!classSession) {
        classSession = await prisma.classSession.create({
            data: {
              subjectId: tokenRecord.subjectId,
              subject: tokenRecord.subject?.name, // Legacy field for compatibility
              teacherId: teacherProfile.id,
              startTime: now,
              endTime: new Date(now.getTime() + 60 * 60 * 1000), // Default 1-hour session
              weekday: getCurrentWeekday(now),
              status: "COMPLETED",
              semester: studentUser.semester ?? 0,
              section: studentUser.studentProfile.sectionId || "N/A",
              semesterId: studentUser.studentProfile.semesterId,
              sectionId: studentUser.studentProfile.sectionId,
            },
        });
    }


    // --- Create Attendance Record ---
    const attendance = await prisma.attendance.create({
      data: {
        studentId: studentUser.studentProfile.id,
        userId: studentId,
        classSessionId: classSession.id,
        status: "PRESENT",
        markedBy: tokenRecord.professorId,
        markedAt: now,
        remarks: `Marked via QR code. Attempt #${attendanceCount + 1}`,
      },
    });

    // Mark the token as used
    await prisma.attendanceToken.update({ where: { token }, data: { used: true } });
    
    await logActivity(studentId, studentUser.name, `Marked attendance for ${tokenRecord.subject?.name}`);
    
    return NextResponse.json({
        message: "Attendance marked successfully!",
        data: {
          subject: tokenRecord.subject?.name,
          status: attendance.status,
          markedAt: attendance.markedAt,
        },
      }, { status: 200 });

  } catch (error: unknown) {
    console.error("Error marking attendance:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      }, { status: 500 });
  }
}

