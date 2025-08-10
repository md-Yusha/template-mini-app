"use client";

import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Video,
  Music,
  Image,
  File,
  X,
  CheckCircle,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import {
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  MAX_FILE_SIZE,
} from "~/lib/constants";
import { cn } from "~/lib/utils";

export function FileUpload() {
  const { addClip, addMediaItem, currentTime } = useVibeForgeStore();
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      id: string;
      file: File;
      type: "video" | "audio" | "image";
      preview?: string;
      addedToMedia: boolean;
    }>
  >([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      let type: "video" | "audio" | "image" = "video";

      if (SUPPORTED_VIDEO_FORMATS.includes(extension)) {
        type = "video";
      } else if (SUPPORTED_AUDIO_FORMATS.includes(extension)) {
        type = "audio";
      } else if (SUPPORTED_IMAGE_FORMATS.includes(extension)) {
        type = "image";
      }

      const fileId = `file-${Date.now()}-${Math.random()}`;

      // Create preview URL for images and videos
      let preview: string | undefined;
      if (type === "image" || type === "video") {
        preview = URL.createObjectURL(file);
      }

      return {
        id: fileId,
        file,
        type,
        preview,
        addedToMedia: false,
      };
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": SUPPORTED_VIDEO_FORMATS.map((ext) => `.${ext}`),
      "audio/*": SUPPORTED_AUDIO_FORMATS.map((ext) => `.${ext}`),
      "image/*": SUPPORTED_IMAGE_FORMATS.map((ext) => `.${ext}`),
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const handleAddToMediaLibrary = (fileData: (typeof uploadedFiles)[0]) => {
    const mediaItem = {
      id: `media-${Date.now()}`,
      type: fileData.type,
      source: fileData.preview || URL.createObjectURL(fileData.file),
      name: fileData.file.name,
      thumbnail: fileData.type === "image" ? fileData.preview : undefined,
      duration: fileData.type === "video" ? 10 : undefined, // Default duration
      size: fileData.file.size,
      createdAt: Date.now(),
      tags: ["uploaded"],
    };

    addMediaItem(mediaItem);

    // Mark as added to media library
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileData.id ? { ...f, addedToMedia: true } : f))
    );
  };

  const handleAddToTimeline = (fileData: (typeof uploadedFiles)[0]) => {
    const clip = {
      id: `clip-${Date.now()}`,
      type: fileData.type,
      source: fileData.preview || URL.createObjectURL(fileData.file),
      startTime: 0,
      duration: fileData.type === "image" ? 3 : 5, // Default duration
      track: 0,
      position: currentTime,
      volume: 1,
    };

    // Add to the first available track of the appropriate type
    addClip("video-track-1", clip);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: "video" | "audio" | "image") => {
    switch (type) {
      case "video":
        return <Video className="w-6 h-6 text-neon-cyan" />;
      case "audio":
        return <Music className="w-6 h-6 text-neon-green" />;
      case "image":
        return <Image className="w-6 h-6 text-neon-magenta" />;
      default:
        return <File className="w-6 h-6 text-muted-foreground" />;
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Drop Zone - Mobile optimized */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-neon-cyan bg-neon-cyan/10"
            : "border-border hover:border-neon-cyan/50 hover:bg-secondary/50"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3">
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div className="text-base">
            {isDragActive ? (
              <span className="text-neon-cyan">Drop files here...</span>
            ) : (
              <span className="text-muted-foreground">
                Drag & drop files here, or{" "}
                <span className="text-neon-cyan">tap to select</span>
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Supports: {SUPPORTED_VIDEO_FORMATS.join(", ")} |{" "}
            {SUPPORTED_AUDIO_FORMATS.join(", ")} |{" "}
            {SUPPORTED_IMAGE_FORMATS.join(", ")}
          </div>
          <div className="text-sm text-muted-foreground">
            Max size: {formatFileSize(MAX_FILE_SIZE)}
          </div>
        </div>
      </div>

      {/* Uploaded Files - Mobile optimized */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">
            Uploaded Files:
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {uploadedFiles.map((fileData) => (
              <motion.div
                key={fileData.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary rounded-lg p-4 border border-border hover:border-neon-cyan/50 transition-colors"
              >
                {/* File Preview */}
                {fileData.preview && (
                  <div className="relative mb-3">
                    {fileData.type === "image" ? (
                      <img
                        src={fileData.preview}
                        alt={fileData.file.name}
                        className="w-full h-32 object-cover rounded"
                      />
                    ) : fileData.type === "video" ? (
                      <video
                        src={fileData.preview}
                        className="w-full h-32 object-cover rounded"
                        muted
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(fileData.type)}
                      </div>
                    )}

                    <button
                      onClick={() => handleRemoveFile(fileData.id)}
                      className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>

                    {/* Added to Media Library Indicator */}
                    {fileData.addedToMedia && (
                      <div className="absolute top-2 left-2 p-2 bg-neon-green/80 rounded-full">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(fileData.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium truncate">
                        {fileData.file.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(fileData.file.size)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - Mobile optimized */}
                  <div className="flex gap-2">
                    {!fileData.addedToMedia && (
                      <button
                        onClick={() => handleAddToMediaLibrary(fileData)}
                        className="flex-1 cyberpunk-btn py-3 px-4 rounded text-sm"
                      >
                        Add to Media
                      </button>
                    )}
                    <button
                      onClick={() => handleAddToTimeline(fileData)}
                      className="flex-1 cyberpunk-btn py-3 px-4 rounded text-sm"
                    >
                      Add to Timeline
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
