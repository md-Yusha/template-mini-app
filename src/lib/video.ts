import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { Track } from "./store";

// Initialize FFmpeg with proper typing
const ffmpeg = new FFmpeg();

// Type assertion for FFmpeg methods
interface FFmpegWithFS extends FFmpeg {
  FS: (
    command: string,
    filename: string,
    data?: Uint8Array | string
  ) => Uint8Array | void;
  run: (...args: string[]) => Promise<void>;
}

const ffmpegWithFS = ffmpeg as FFmpegWithFS;

let ffmpegLoaded = false;

// Load FFmpeg
export async function loadFFmpeg(): Promise<void> {
  if (!ffmpegLoaded) {
    await ffmpeg.load({
      coreURL: await toBlobURL(`/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegLoaded = true;
  }
}

// Helper function to safely read file from FFmpeg FS
function readFileFromFS(filename: string): Uint8Array | null {
  try {
    const result = ffmpegWithFS.FS("readFile", filename);
    return result instanceof Uint8Array ? result : null;
  } catch {
    return null;
  }
}

// Helper function to convert Uint8Array to Blob
function uint8ArrayToBlob(data: Uint8Array, type: string): Blob {
  return new Blob([data], { type });
}

// Get video duration
export async function getVideoDuration(file: File): Promise<number> {
  await loadFFmpeg();

  try {
    ffmpegWithFS.FS("writeFile", "input.mp4", await fetchFile(file));

    await ffmpegWithFS.run("-i", "input.mp4", "-f", "null", "-");

    // Parse duration from logs
    const fileData = readFileFromFS("input.mp4");
    if (fileData) {
      const durationMatch = fileData
        .toString()
        .match(/Duration: (\d{2}):(\d{2}):(\d{2})/);

      if (durationMatch) {
        const hours = parseInt(durationMatch[1]);
        const minutes = parseInt(durationMatch[2]);
        const seconds = parseInt(durationMatch[3]);
        return hours * 3600 + minutes * 60 + seconds;
      }
    }

    return 0;
  } catch (error) {
    console.error("Error getting video duration:", error);
    return 0;
  } finally {
    // Cleanup
    try {
      ffmpegWithFS.FS("unlink", "input.mp4");
    } catch {
      // File might not exist
    }
  }
}

// Trim video
export async function trimVideo(
  file: File,
  startTime: number,
  duration: number
): Promise<Blob> {
  await loadFFmpeg();

  try {
    ffmpegWithFS.FS("writeFile", "input.mp4", await fetchFile(file));

    await ffmpegWithFS.run(
      "-i",
      "input.mp4",
      "-ss",
      startTime.toString(),
      "-t",
      duration.toString(),
      "-c",
      "copy",
      "output.mp4"
    );

    const data = readFileFromFS("output.mp4");
    if (!data) throw new Error("Failed to read output file");
    return uint8ArrayToBlob(data, "video/mp4");
  } catch (error) {
    console.error("Error trimming video:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      ffmpegWithFS.FS("unlink", "input.mp4");
      ffmpegWithFS.FS("unlink", "output.mp4");
    } catch {
      // Files might not exist
    }
  }
}

// Extract audio from video
export async function extractAudio(file: File): Promise<Blob> {
  await loadFFmpeg();

  try {
    ffmpegWithFS.FS("writeFile", "input.mp4", await fetchFile(file));

    await ffmpegWithFS.run(
      "-i",
      "input.mp4",
      "-vn",
      "-acodec",
      "mp3",
      "output.mp3"
    );

    const data = readFileFromFS("output.mp3");
    if (!data) throw new Error("Failed to read output file");
    return uint8ArrayToBlob(data, "audio/mp3");
  } catch (error) {
    console.error("Error extracting audio:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      ffmpegWithFS.FS("unlink", "input.mp4");
      ffmpegWithFS.FS("unlink", "output.mp3");
    } catch {
      // Files might not exist
    }
  }
}

// Add text overlay to video
export async function addTextOverlay(
  file: File,
  text: string,
  position: { x: number; y: number },
  fontSize: number = 24,
  color: string = "white"
): Promise<Blob> {
  await loadFFmpeg();

  try {
    ffmpegWithFS.FS("writeFile", "input.mp4", await fetchFile(file));

    const filter = `drawtext=text='${text}':fontsize=${fontSize}:fontcolor=${color}:x=${position.x}:y=${position.y}`;

    await ffmpegWithFS.run(
      "-i",
      "input.mp4",
      "-vf",
      filter,
      "-c:a",
      "copy",
      "output.mp4"
    );

    const data = readFileFromFS("output.mp4");
    if (!data) throw new Error("Failed to read output file");
    return uint8ArrayToBlob(data, "video/mp4");
  } catch (error) {
    console.error("Error adding text overlay:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      ffmpegWithFS.FS("unlink", "input.mp4");
      ffmpegWithFS.FS("unlink", "output.mp4");
    } catch {
      // Files might not exist
    }
  }
}

// Concatenate multiple video files
export async function concatenateVideos(files: File[]): Promise<Blob> {
  await loadFFmpeg();

  try {
    // Write all input files
    for (let i = 0; i < files.length; i++) {
      ffmpegWithFS.FS("writeFile", `input${i}.mp4`, await fetchFile(files[i]));
    }

    // Create concat file
    const concatContent = files.map((_, i) => `file input${i}.mp4`).join("\n");
    ffmpegWithFS.FS("writeFile", "concat.txt", concatContent);

    await ffmpegWithFS.run(
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "concat.txt",
      "-c",
      "copy",
      "output.mp4"
    );

    const data = readFileFromFS("output.mp4");
    if (!data) throw new Error("Failed to read output file");
    return uint8ArrayToBlob(data, "video/mp4");
  } catch (error) {
    console.error("Error concatenating videos:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      files.forEach((_, i) => {
        try {
          ffmpegWithFS.FS("unlink", `input${i}.mp4`);
        } catch {
          // File might not exist
        }
      });
      ffmpegWithFS.FS("unlink", "concat.txt");
      ffmpegWithFS.FS("unlink", "output.mp4");
    } catch {
      // Files might not exist
    }
  }
}

// Export project to video
export async function exportProject(
  tracks: Track[],
  resolution: { width: number; height: number },
  fps: number,
  duration: number
): Promise<Blob> {
  await loadFFmpeg();

  try {
    // This is a simplified implementation
    // In a real implementation, you would:
    // 1. Process each track and its clips
    // 2. Apply effects and transitions
    // 3. Mix audio tracks
    // 4. Render the final video

    // For now, we'll create a simple test video
    const testVideo = new Blob(["test video content"], { type: "video/mp4" });
    ffmpegWithFS.FS("writeFile", "input.mp4", await fetchFile(testVideo));

    await ffmpegWithFS.run(
      "-i",
      "input.mp4",
      "-vf",
      `scale=${resolution.width}:${resolution.height}`,
      "-r",
      fps.toString(),
      "-t",
      duration.toString(),
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      "output.mp4"
    );

    const data = readFileFromFS("output.mp4");
    if (!data) throw new Error("Failed to read output file");
    return uint8ArrayToBlob(data, "video/mp4");
  } catch (error) {
    console.error("Error exporting project:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      ffmpegWithFS.FS("unlink", "input.mp4");
      ffmpegWithFS.FS("unlink", "output.mp4");
    } catch {
      // Files might not exist
    }
  }
}

// Get video thumbnail
export async function getVideoThumbnail(
  file: File,
  time: number = 0
): Promise<Blob> {
  await loadFFmpeg();

  try {
    ffmpegWithFS.FS("writeFile", "input.mp4", await fetchFile(file));

    await ffmpegWithFS.run(
      "-i",
      "input.mp4",
      "-ss",
      time.toString(),
      "-vframes",
      "1",
      "-f",
      "image2",
      "thumbnail.jpg"
    );

    const data = readFileFromFS("thumbnail.jpg");
    if (!data) throw new Error("Failed to read thumbnail file");
    return uint8ArrayToBlob(data, "image/jpeg");
  } catch (error) {
    console.error("Error getting thumbnail:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      ffmpegWithFS.FS("unlink", "input.mp4");
      ffmpegWithFS.FS("unlink", "thumbnail.jpg");
    } catch {
      // Files might not exist
    }
  }
}

// Convert video format
export async function convertVideoFormat(
  file: File,
  format: "mp4" | "webm" | "mov"
): Promise<Blob> {
  await loadFFmpeg();

  try {
    ffmpegWithFS.FS("writeFile", "input.mp4", await fetchFile(file));

    const outputFile = `output.${format}`;
    const codec = format === "webm" ? "libvpx" : "libx264";

    await ffmpegWithFS.run(
      "-i",
      "input.mp4",
      "-c:v",
      codec,
      "-c:a",
      "aac",
      outputFile
    );

    const data = readFileFromFS(outputFile);
    if (!data) throw new Error("Failed to read output file");
    return uint8ArrayToBlob(data, `video/${format}`);
  } catch (error) {
    console.error("Error converting video format:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      ffmpegWithFS.FS("unlink", "input.mp4");
      ffmpegWithFS.FS("unlink", `output.${format}`);
    } catch {
      // Files might not exist
    }
  }
}

// Apply video effects
export async function applyVideoEffects(
  file: File,
  effects: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
  }
): Promise<Blob> {
  await loadFFmpeg();

  try {
    ffmpegWithFS.FS("writeFile", "input.mp4", await fetchFile(file));

    const filters = [];

    if (effects.brightness !== undefined) {
      filters.push(`eq=brightness=${effects.brightness}`);
    }
    if (effects.contrast !== undefined) {
      filters.push(`eq=contrast=${effects.contrast}`);
    }
    if (effects.saturation !== undefined) {
      filters.push(`eq=saturation=${effects.saturation}`);
    }
    if (effects.blur !== undefined) {
      filters.push(`boxblur=${effects.blur}`);
    }

    const filterString = filters.join(",");

    await ffmpegWithFS.run(
      "-i",
      "input.mp4",
      "-vf",
      filterString,
      "-c:a",
      "copy",
      "output.mp4"
    );

    const data = readFileFromFS("output.mp4");
    if (!data) throw new Error("Failed to read output file");
    return uint8ArrayToBlob(data, "video/mp4");
  } catch (error) {
    console.error("Error applying video effects:", error);
    throw error;
  } finally {
    // Cleanup
    try {
      ffmpegWithFS.FS("unlink", "input.mp4");
      ffmpegWithFS.FS("unlink", "output.mp4");
    } catch {
      // Files might not exist
    }
  }
}
