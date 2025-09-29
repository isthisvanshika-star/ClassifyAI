import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekday, logActivity } from "@/lib/helper";
import { sendAttendanceQrEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { subjectId, teacherUserId, studentIds, sectionId, location, mode } = await request.json();

    if (!subjectId || !teacherUserId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !sectionId || !mode) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const teacherRecord = await prisma.teacher.findUnique({
      where: { userId: teacherUserId },
      include: { user: { select: { name: true, campusId: true } } },
    });

    if (!teacherRecord || !teacherRecord.user || !teacherRecord.user.campusId) {
      return NextResponse.json({ message: "Teacher or associated campus not found" }, { status: 404 });
    }
    const campusId = teacherRecord.user.campusId;

    const [subjectRecord, students] = await Promise.all([
      prisma.subject.findFirst({ where: { id: subjectId, campusId: campusId } }),
      prisma.student.findMany({
        where: { id: { in: studentIds }, sectionId: sectionId, user: { campusId: campusId } },
        include: { user: { select: { email: true, semester: true } }, section: { select: { name: true } }, semester: { select: { id: true } } },
      }),
    ]);

    if (!subjectRecord) {
      return NextResponse.json({ message: "Subject not found on this campus" }, { status: 404 });
    }
    if (students.length !== studentIds.length) {
      return NextResponse.json({ message: "One or more students were not found on this campus/section." }, { status: 404 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let classSession = await prisma.classSession.findFirst({
        where: {
            teacherId: teacherRecord.id,
            subjectId: subjectId,
            sectionId: sectionId,
            date: today,
        }
    });

    if (classSession) {
        classSession = await prisma.classSession.update({
            where: { id: classSession.id },
            data: {
                status: "LIVE",
                attendanceWindowEndsAt: expiresAt,
                startTime: now,
                endTime: expiresAt,
            }
        });
    } else {
        const firstStudent = students[0];
        classSession = await prisma.classSession.create({
            data: {
                date: today,
                teacherId: teacherRecord.id,
                subjectId: subjectId,
                campusId: campusId,
                sectionId: sectionId,
                semesterId: firstStudent.semesterId,
                semester: firstStudent.user.semester ?? 0,
                section: firstStudent.section?.name || "N/A",
                weekday: getCurrentWeekday(now),
                startTime: now,
                endTime: expiresAt,
                status: "LIVE",
                attendanceWindowEndsAt: expiresAt,
            }
        });
    }
    // --- END OF FIX 1 ---

    const emailPromises = students.map(async (student) => {
      if (!student.user.email) return;

      const token = uuidv4();
      const payload = JSON.stringify({ token });
      const qrCodeDataUrl = await QRCode.toDataURL(payload);

      await prisma.attendanceToken.create({
        data: {
          token,
          expiresAt,
          subjectId,
          professorId: teacherRecord.id,
          studentId: student.id,
          mode: mode === 'ONLINE' ? 'ONLINE' : 'OFFLINE',
          latitude: mode === 'OFFLINE' ? location?.latitude : null,
          longitude: mode === 'OFFLINE' ? location?.longitude : null,
        },
      });
      await sendAttendanceQrEmail(
        student.user.email,
        subjectRecord.name,
        teacherRecord.user.name,
        qrCodeDataUrl
      );
    });

    await Promise.all(emailPromises);

    await logActivity(
      teacherUserId,
      teacherRecord.user.name,
      `Sent tokens for ${subjectRecord.name} to ${studentIds.length} students.`
    );
    
    return NextResponse.json({
        message: `QR codes sent successfully to ${studentIds.length} students.`,
        classSessionId: classSession.id
    }, { status: 200 });

  } catch (error) {
    console.error("Error generating unique attendance tokens:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}