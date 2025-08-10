import { NextRequest, NextResponse } from "next/server";
import {
  trimVideo,
  extractAudio,
  addTextOverlay,
  applyVideoEffects,
  convertVideoFormat,
} from "~/lib/video";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const operation = formData.get("operation") as string;
    const options = JSON.parse((formData.get("options") as string) || "{}");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let result: Blob;

    switch (operation) {
      case "trim":
        const { startTime, duration } = options;
        result = await trimVideo(file, startTime, duration);
        break;

      case "extract-audio":
        result = await extractAudio(file);
        break;

      case "add-text":
        const { text, position, fontSize, color } = options;
        result = await addTextOverlay(file, text, position, fontSize, color);
        break;

      case "apply-effects":
        const { effects } = options;
        result = await applyVideoEffects(file, effects);
        break;

      case "convert-format":
        const { format } = options;
        result = await convertVideoFormat(file, format);
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported operation" },
          { status: 400 }
        );
    }

    // Convert blob to array buffer for response
    const arrayBuffer = await result.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": result.type,
        "Content-Disposition": `attachment; filename="processed-${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Video processing error:", error);
    return NextResponse.json(
      { error: "Video processing failed" },
      { status: 500 }
    );
  }
}
