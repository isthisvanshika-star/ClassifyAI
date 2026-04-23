import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    if (!subjectId)
      return NextResponse.json({ error: "Id required" }, { status: 400 });
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { name: true },
    });
    if (!subject)
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    const pyqs = await prisma.resource.findMany({
      where: { subjectId, resourceType: "PYQ" },
      select: { title: true, aiSummary: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    if (pyqs.length === 0) {
      return NextResponse.json({ error: "Not enough data." }, { status: 404 });
    }
    const compiledData = pyqs
      .map((pyq, i) => {
        `Paper ${i + 1} (${pyq.title}):\n${pyq.aiSummary.join("\n")}`;
      })
      .join("\n\n");

    console.log(`Analyzing ${pyqs.length} PYQs for ${subject.name}....`);
    const prompt = `
You are an expert university professor and data analyst.
Analyze the following data extracted from previous year question papers for the subject "${subject.name}".

Identify the most frequently asked topics and predict the top 5 most important topics for the upcoming exam.

Data from past papers:
${compiledData}

Return ONLY a valid JSON array with no markdown, no backticks, no explanation. Exact structure:
[
  {
    "topic": "Name of the topic",
    "probability": 95,
    "weightage": "High",
    "reason": "Why is this important? (1 short sentence)"
  }
]
    `;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Campus AI Predictor",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", JSON.stringify(data, null, 2));
      throw new Error(`OpenRouter API failed: ${response.status}`);
    }
    const aiText = data.choices?.[0]?.message?.content ?? "";
    const cleaned = aiText.replace(/```json|```/g, "").trim();
    const predictions = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      subject: subject.name,
      totalPapersAnalyzed: pyqs.length,
      predictions,
    });
  } catch (error) {
    console.error("Error in AI Prediction Engine:", error);
    return NextResponse.json(
      { error: "Failed to generate predictions" },
      { status: 500 },
    );
  }
}
