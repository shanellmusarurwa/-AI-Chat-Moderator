import { NextResponse } from "next/server";

class AIChatModerator {
  constructor() {
    // System prompt defining AI behavior
    this.systemPrompt = `You are a helpful, respectful, and honest assistant.
Always provide accurate and harmless information.
If you're unsure about something, say so rather than making up information.
Be concise and clear in your responses.`;

    // List of banned keywords for moderation
    this.bannedKeywords = [
      "kill",
      "murder",
      "assassinate",
      "eliminate",
      "hack",
      "crack",
      "unauthorized access",
      "bomb",
      "explosive",
      "terrorist",
      "attack",
      "harm",
      "hurt",
      "injure",
      "violence",
      "hate",
      "discriminate",
      "racist",
      "sexist",
    ];
  }

  moderateInput(userInput) {
    const userInputLower = userInput.toLowerCase();

    for (const keyword of this.bannedKeywords) {
      if (userInputLower.includes(keyword.toLowerCase())) {
        console.log(`Moderation triggered by keyword: '${keyword}'`);
        return false;
      }
    }
    return true;
  }

  moderateOutput(aiResponse) {
    let moderatedResponse = aiResponse;

    for (const keyword of this.bannedKeywords) {
      const regex = new RegExp(keyword, "gi");
      moderatedResponse = moderatedResponse.replace(regex, "[REDACTED]");
    }

    return moderatedResponse;
  }

  async callAIService(userPrompt) {
    try {
      console.log("Calling AI service with prompt:", userPrompt);

      // Using the third-party service that provides Gemini 2.0 Flash
      const response = await fetch(
        "https://api.openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.AI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
              {
                role: "system",
                content: this.systemPrompt,
              },
              {
                role: "user",
                content: userPrompt,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Response not OK:", response.status, errorText);
        throw new Error(
          `API request failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response received:", data);

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from API");
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("AI Service Error:", error);

      // More specific error handling
      if (error.message.includes("401")) {
        throw new Error("Invalid API key. Please check your API key.");
      } else if (error.message.includes("429")) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (error.message.includes("quota")) {
        throw new Error("API quota exceeded. Please check your usage limits.");
      }

      throw new Error(`AI Service Error: ${error.message}`);
    }
  }

  async processRequest(userPrompt) {
    // Input moderation
    if (!this.moderateInput(userPrompt)) {
      throw new Error("INPUT_VIOLATION");
    }

    // Call AI service
    const aiResponse = await this.callAIService(userPrompt);

    // Output moderation
    const moderatedResponse = this.moderateOutput(aiResponse);

    return {
      response: moderatedResponse,
      wasModerated: moderatedResponse !== aiResponse,
    };
  }
}

export async function POST(request) {
  console.log("API Route called");

  try {
    const { prompt } = await request.json();
    console.log("Received prompt:", prompt);

    if (!prompt || typeof prompt !== "string") {
      console.log("Invalid prompt received");
      return NextResponse.json(
        { error: "Please enter a valid prompt" },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.AI_API_KEY) {
      console.error("AI_API_KEY is not configured");
      return NextResponse.json(
        { error: "API key not configured in environment variables" },
        { status: 500 }
      );
    }

    console.log("Creating moderator instance...");
    const moderator = new AIChatModerator();
    console.log("Processing request...");
    const result = await moderator.processRequest(prompt);
    console.log("Request processed successfully");

    return NextResponse.json({
      success: true,
      data: result,
      message: "Request processed successfully",
    });
  } catch (error) {
    console.error("API Route Error:", error);

    if (error.message === "INPUT_VIOLATION") {
      return NextResponse.json(
        {
          success: false,
          error: "Your input violated the content moderation policy.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Internal server error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

// Add a simple GET handler for testing
export async function GET() {
  return NextResponse.json({
    status: "OK",
    message: "Chat API is running",
    timestamp: new Date().toISOString(),
  });
}
