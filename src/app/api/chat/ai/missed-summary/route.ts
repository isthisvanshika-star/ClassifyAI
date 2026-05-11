import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API key is missing" },
        { status: 500 },
      );
    }

    const recentMessages = messages
      .slice(-30)
      .map((msg: any) => {
        return `${msg.senderName || "Someone"}: ${msg.content || ""}`;
      })
      .join("\n");

    const prompt = `
You are an academic chat summarizer for a college app called Classify AI.

Summarize what the user missed in this chat.

Make the summary:
- short
- useful
- student-friendly
- in bullet points
- focused on assignments, deadlines, exams, resources, doubts, and teacher clarifications

Rules:
- Do not invent details.
- Ignore casual messages if they are not important.
- If nothing important happened, say that clearly.
- Return only the summary.

Recent chat messages:
${recentMessages}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Classify AI",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Missed summary AI error:", errorText);

      return NextResponse.json(
        { error: "Failed to generate summary" },
        { status: 500 },
      );
    }

    const data = await response.json();

    const summary =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Could not generate summary.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Missed summary error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}