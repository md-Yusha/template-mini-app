import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { generateAIContent, AIGenerationRequest } from "~/lib/ai";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const fid = await verifyAuth(request);
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: AIGenerationRequest = await request.json();

    if (!body.type || !body.prompt) {
      return NextResponse.json(
        { error: "Missing required fields: type and prompt" },
        { status: 400 }
      );
    }

    // Generate AI content
    const result = await generateAIContent(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Generation failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      type: body.type,
      prompt: body.prompt,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
