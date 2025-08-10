import { NextRequest, NextResponse } from "next/server";
import { exportProject } from "~/lib/video";
import { uploadToIPFS } from "~/lib/ipfs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tracks, resolution, fps, duration, projectName } = body;

    if (!tracks || !resolution || !fps || !duration) {
      return NextResponse.json(
        { error: "Missing required project data" },
        { status: 400 }
      );
    }

    // Export the project to video
    const videoBlob = await exportProject(tracks, resolution, fps, duration);

    // Upload to IPFS
    const uploadResult = await uploadToIPFS(
      videoBlob,
      `${projectName || "vibeforge-project"}.mp4`
    );

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cid: uploadResult.cid,
      url: uploadResult.url,
    });
  } catch (error) {
    console.error("Project export error:", error);
    return NextResponse.json(
      { error: "Project export failed" },
      { status: 500 }
    );
  }
}
