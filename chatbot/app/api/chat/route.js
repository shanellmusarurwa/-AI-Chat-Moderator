import { NextResponse } from "next/server";

// Simple test version - remove all complex classes
export async function POST(request) {
  try {
    console.log("=== CHAT API CALLED ===");

    const { prompt } = await request.json();
    console.log("Prompt:", prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    // Simple moderation check
    const bannedWords = ["kill", "hack", "bomb", "attack", "violence"];
    const hasBannedWord = bannedWords.some((word) =>
      prompt.toLowerCase().includes(word.toLowerCase())
    );

    if (hasBannedWord) {
      return NextResponse.json(
        {
          error: "Your input violated the moderation policy.",
        },
        { status: 400 }
      );
    }

    // HARDCODE the API key for now to test
    const API_KEY =
      "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";

    console.log("Calling OpenRouter API...");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Chat Moderator",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      }
    );

    console.log("OpenRouter response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenRouter response received");

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response from OpenRouter");
    }

    let aiResponse = data.choices[0].message.content;

    // Simple output moderation
    bannedWords.forEach((word) => {
      const regex = new RegExp(word, "gi");
      aiResponse = aiResponse.replace(regex, "[REDACTED]");
    });

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        wasModerated: false, // Simplified for now
      },
    });
  } catch (error) {
    console.error("FINAL ERROR:", error);
    return NextResponse.json(
      {
        error: `Failed: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Chat API is running",
    message: "Try sending a POST request with a prompt",
  });
}
