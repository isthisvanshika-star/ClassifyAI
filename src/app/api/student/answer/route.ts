import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

async function callWithRetry(prompt: string): Promise<string> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Campus AI Answer Engine",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500,
        }),
      },
    );

    const data = await response.json();

    if (response.status === 429) {
      console.warn(
        `[Answer] Rate limited on attempt ${attempt}/${MAX_RETRIES}. Retrying in ${RETRY_DELAY_MS}ms...`,
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((res) => setTimeout(res, RETRY_DELAY_MS * attempt));
        continue;
      }
      throw new Error("RATE_LIMITED");
    }

    if (!response.ok) {
      throw new Error(
        `OpenRouter error: ${data?.error?.message ?? response.status}`,
      );
    }

    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("Empty response from model");

    const model = data.model ?? "openrouter/free";
    console.log(`[Answer] Generated using: ${model}`);
    return text;
  }

  throw new Error("RATE_LIMITED");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const topic = searchParams.get("topic");

    if (!subjectId || !topic) {
      return NextResponse.json(
        { error: "subjectId and topic are required" },
        { status: 400 },
      );
    }

    const normalizedTopic = topic.trim().toLowerCase();
    const cacheKey = `answer:${subjectId}:${normalizedTopic}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        answer: JSON.parse(cached),
        cached: true,
      });
    }
    const lockKey = `lock:${cacheKey}`;
    const lock = await redis.set(lockKey, "1", "EX", 10, "NX");

    if (!lock) {
      await new Promise((r) => setTimeout(r, 500));
      const retry = await redis.get(cacheKey);
      if (retry) {
        return NextResponse.json({
          success: true,
          answer: JSON.parse(retry),
          cached: true,
        });
      }
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { name: true },
    });
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // 2. Fetch NOTES with AI summaries
    const notes = await prisma.resource.findMany({
      where: {
        subjectId,
        resourceType: "NOTES",
        aiSummary: { isEmpty: false },
      },
      select: { title: true, aiSummary: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    // 3. Fetch PYQs with AI summaries
    const pyqs = await prisma.resource.findMany({
      where: {
        subjectId,
        resourceType: "PYQ",
        aiSummary: { isEmpty: false },
      },
      select: { title: true, aiSummary: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const hasNotes = notes.length > 0;
    const hasPyqs = pyqs.length > 0;

    // 4. Compile context
    let contextBlock = "";
    if (hasNotes) {
      contextBlock += `\n\n--- CLASS NOTES ---\n${notes
        .map((n, i) => `Note ${i + 1} (${n.title}):\n${n.aiSummary.join("\n")}`)
        .join("\n\n")}`;
    }
    if (hasPyqs) {
      contextBlock += `\n\n--- PAST YEAR QUESTIONS ---\n${pyqs
        .map((p, i) => `PYQ ${i + 1} (${p.title}):\n${p.aiSummary.join("\n")}`)
        .join("\n\n")}`;
    }

    // 5. Build prompt
    const prompt =
      hasNotes || hasPyqs
        ? `You are an expert university professor for "${subject.name}".
A student needs a thorough exam answer for this topic: "${topic}"

Context from their uploaded class notes and past year papers:
${contextBlock}

Generate a complete exam answer using the context above.
Return ONLY valid JSON, no markdown, no backticks, no extra text:
{
  "summary": "2-3 sentence concise answer the student could write directly in an exam.",
  "sections": [
    { "heading": "Section heading", "content": "Detailed explanation (3-5 sentences)." }
  ],
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "sourcedFromNotes": true
}`
        : `You are an expert university professor for "${subject.name}".
A student needs a thorough exam answer for this topic: "${topic}"
No class notes uploaded yet — generate from your expertise.

Return ONLY valid JSON, no markdown, no backticks, no extra text:
{
  "summary": "2-3 sentence concise answer the student could write directly in an exam.",
  "sections": [
    { "heading": "Section heading", "content": "Detailed explanation (3-5 sentences)." }
  ],
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "sourcedFromNotes": false
}`;

    // 6. Call with retry
    const aiText = await callWithRetry(prompt);
    const cleaned = aiText.replace(/```json|```/g, "").trim();
    const answer = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      topic,
      subject: subject.name,
      notesUsed: notes.length,
      pyqsUsed: pyqs.length,
      answer,
    });
  } catch (error: any) {
    if (error?.message === "RATE_LIMITED") {
      return NextResponse.json(
        { error: "AI is busy right now. Please wait a moment and try again." },
        { status: 429 },
      );
    }
    console.error("Error in AI Answer Engine:", error);
    return NextResponse.json(
      { error: "Failed to generate answer" },
      { status: 500 },
    );
  }
}
