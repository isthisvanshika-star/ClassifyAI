import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json("Missing teacherId parameter", { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json("Teacher not found", { status: 404 });
    }
    const submissions = await prisma.submission.findMany({
      where: { assignment: { teacherId: teacher.id } },
      include: {
        student: {
          include: { user: true, semester: true, section: true },
        },
        assignment: {
          include: { subject: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    let csvString =
      "Student Name,Email,Semester,Section,Assignment Title,Subject,Status,Marks Obtained,Total Marks,AI Plagiarism %\n";

    submissions.forEach((sub) => {
      const name = sub.student?.user?.name || "Unknown";
      const email = sub.student?.user?.email || "N/A";
      const semester = sub.student?.semester?.name || "N/A";
      const section = sub.student?.section?.name || "N/A";
      const title = sub.assignment?.title || "N/A";
      const subject = sub.assignment?.subject?.name || "N/A";

      const status =
        sub.grade !== null && sub.grade !== undefined ? "GRADED" : "SUBMITTED";
      const marks =
        sub.grade !== null && sub.grade !== undefined
          ? sub.grade
          : "Not Graded";
      const total = sub.assignment?.totalMarks || "N/A";
      const aiScore =
        sub.aiProbability !== null && sub.aiProbability !== undefined
          ? `${sub.aiProbability}%`
          : "N/A";

      csvString += `"${name}","${email}","${semester}","${section}","${title}","${subject}","${status}","${marks}","${total}","${aiScore}"\n`;
    });

    const teacherName = teacher.user.name.replace(/\s+/g, "_");
    const dateStr = new Date().toISOString().split("T")[0];
    let subjectName = "All_Subjects";
    let semesterName = "All_Semesters";
    let sectionName = "All_Sections";
    if (submissions.length > 0) {
      const firstSub = submissions[0];
      if (firstSub.assignment?.subject?.name) {
        subjectName = firstSub.assignment.subject.name.replace(/\s+/g, "_");
      }
      if (firstSub.student?.semester?.name) {
        semesterName = firstSub.student.semester.name.replace(/\s+/g, "_");
      }
      if (firstSub.student?.section?.name) {
        sectionName = firstSub.student.section.name.replace(/\s+/g, "_");
      }
    }

    const dynamicFileName = `ClassifyAI_${teacherName}_${subjectName}_${semesterName}_${sectionName}_${dateStr}.csv`; // 4. Return the file
    return new NextResponse(csvString, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${dynamicFileName}"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Failed to export data", { status: 500 });
  }
}
