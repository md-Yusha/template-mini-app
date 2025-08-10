import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { exportProject } from "~/lib/video";
import { Track } from "~/lib/store";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const fid = await verifyAuth(request);
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { tracks, resolution, fps, duration, format = "mp4" } = body;

    if (!tracks || !Array.isArray(tracks)) {
      return NextResponse.json(
        { error: "Missing or invalid tracks data" },
        { status: 400 }
      );
    }

    // Validate resolution
    if (!resolution || !resolution.width || !resolution.height) {
      return NextResponse.json(
        { error: "Missing or invalid resolution" },
        { status: 400 }
      );
    }

    // Validate fps
    if (!fps || fps < 1 || fps > 120) {
      return NextResponse.json(
        { error: "Invalid fps value (1-120)" },
        { status: 400 }
      );
    }

    // Validate duration
    if (!duration || duration < 1 || duration > 3600) {
      return NextResponse.json(
        { error: "Invalid duration (1-3600 seconds)" },
        { status: 400 }
      );
    }

    // Export video
    const videoBlob = await exportProject(
      tracks as Track[],
      resolution,
      fps,
      duration
    );

    // Convert to appropriate format if needed
    const finalBlob = videoBlob;
    // Format conversion logic would go here if needed

    // Return the video as a response
    return new NextResponse(finalBlob, {
      headers: {
        "Content-Type": `video/${format}`,
        "Content-Disposition": `attachment; filename="vibeforge-export-${Date.now()}.${format}"`,
      },
    });
  } catch (error) {
    console.error("Video export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
