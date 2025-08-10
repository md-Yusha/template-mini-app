import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "~/lib/auth";
import { uploadVideoWithMetadata, VideoMetadata } from "~/lib/ipfs";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const fid = await verifyAuth(request);
    if (!fid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const videoFile = formData.get("video") as File;
    const metadata = JSON.parse(
      formData.get("metadata") as string
    ) as VideoMetadata;

    if (!videoFile || !metadata) {
      return NextResponse.json(
        { error: "Missing required fields: video and metadata" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!videoFile.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB." },
        { status: 400 }
      );
    }

    // Convert File to Blob
    const videoBlob = new Blob([await videoFile.arrayBuffer()], {
      type: videoFile.type,
    });

    // Upload to IPFS
    const result = await uploadVideoWithMetadata(videoBlob, {
      ...metadata,
      creatorFid: fid,
      createdAt: Date.now(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cid: result.cid,
      url: result.url,
      metadata: {
        ...metadata,
        creatorFid: fid,
        createdAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
