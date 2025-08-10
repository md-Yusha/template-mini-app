"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Image,
  Video,
  Music,
  Type,
  Trash2,
  Search,
  Grid,
  List,
  Upload,
  Plus,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import { cn } from "~/lib/utils";
import {
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_AUDIO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  MAX_FILE_SIZE,
} from "~/lib/constants";

export function MediaArea() {
  const {
    mediaLibrary,
    selectedMedia,
    setSelectedMedia,
    removeMediaItem,
    addMediaItem,
    currentTime,
    addClip,
  } = useVibeForgeStore();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "video" | "audio" | "image" | "text"
  >("all");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showUploadArea, setShowUploadArea] = useState(false);

  const filteredMedia = mediaLibrary.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.setData("text/plain", itemId);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        let type: "video" | "audio" | "image" = "video";

        if (SUPPORTED_VIDEO_FORMATS.includes(extension)) {
          type = "video";
        } else if (SUPPORTED_AUDIO_FORMATS.includes(extension)) {
          type = "audio";
        } else if (SUPPORTED_IMAGE_FORMATS.includes(extension)) {
          type = "image";
        }

        const fileId = `media-${Date.now()}-${Math.random()}`;
        const preview = URL.createObjectURL(file);

        const mediaItem = {
          id: fileId,
          type: type,
          source: preview,
          name: file.name,
          thumbnail: type === "image" ? preview : undefined,
          duration: type === "video" ? 10 : undefined,
          size: file.size,
          createdAt: Date.now(),
          tags: ["uploaded"],
        };

        addMediaItem(mediaItem);
      });

      setShowUploadArea(false);
    },
    [addMediaItem]
  );

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

  const handleAddToTimeline = (item: {
    id: string;
    type: "video" | "audio" | "image" | "text";
    source: string;
    name: string;
  }) => {
    const clip = {
      id: `clip-${Date.now()}`,
      type: item.type,
      source: item.source,
      startTime: 0,
      duration: item.type === "image" ? 3 : 5,
      track: 0,
      position: currentTime,
      volume: 1,
    };

    addClip("video-track-1", clip);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "image":
        return <Image className="w-4 h-4" />;
      case "text":
        return <Type className="w-4 h-4" />;
      default:
        return <Video className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-neon-cyan" />
          <h2 className="text-neon-cyan text-lg font-bold">Media Library</h2>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => setShowUploadArea(!showUploadArea)}
          className="cyberpunk-btn px-3 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Upload Area */}
      {showUploadArea && (
        <div className="mb-4">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200",
              isDragActive
                ? "border-neon-cyan bg-neon-cyan/10"
                : "border-border hover:border-neon-cyan/50 hover:bg-secondary/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-sm">
                {isDragActive ? (
                  <span className="text-neon-cyan">Drop files here...</span>
                ) : (
                  <span className="text-muted-foreground">
                    Drag & drop files here, or{" "}
                    <span className="text-neon-cyan">tap to select</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Supports: {SUPPORTED_VIDEO_FORMATS.join(", ")} |{" "}
                {SUPPORTED_AUDIO_FORMATS.join(", ")} |{" "}
                {SUPPORTED_IMAGE_FORMATS.join(", ")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters - Mobile optimized */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-neon-cyan focus:outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value as "all" | "video" | "audio" | "image" | "text"
              )
            }
            className="flex-1 p-3 bg-secondary border border-border rounded-lg text-foreground focus:border-neon-cyan focus:outline-none text-sm"
          >
            <option value="all">All Types</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="image">Image</option>
            <option value="text">Text</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-3 bg-secondary border border-border rounded-lg text-foreground hover:border-neon-cyan transition-colors"
          >
            {viewMode === "grid" ? (
              <List className="w-4 h-4" />
            ) : (
              <Grid className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Media Grid/List - Mobile optimized with proper scrolling */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Video className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No media found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "Upload media or generate content with AI to get started"}
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "space-y-3 pb-4",
              viewMode === "grid" && "grid grid-cols-2 gap-3"
            )}
          >
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "relative group cursor-pointer border border-border rounded-lg overflow-hidden transition-all",
                  selectedMedia === item.id
                    ? "border-neon-cyan bg-neon-cyan/10"
                    : "hover:border-neon-cyan/50 hover:bg-secondary/50",
                  viewMode === "grid" ? "aspect-video" : "h-20"
                )}
                draggable
                onDragStart={(e: React.DragEvent) =>
                  handleDragStart(e, item.id)
                }
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedMedia(item.id)}
              >
                {/* Thumbnail/Preview */}
                <div className="relative h-full">
                  {item.type === "image" && item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {item.type === "video" && (
                    <div className="w-full h-full bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 flex items-center justify-center">
                      <Video className="w-8 h-8 text-neon-cyan" />
                    </div>
                  )}
                  {item.type === "audio" && (
                    <div className="w-full h-full bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center">
                      <Music className="w-8 h-8 text-neon-green" />
                    </div>
                  )}
                  {item.type === "text" && (
                    <div className="w-full h-full bg-gradient-to-br from-neon-magenta/20 to-neon-yellow/20 flex items-center justify-center">
                      <Type className="w-8 h-8 text-neon-magenta" />
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                    <div className="flex items-center gap-1 text-white text-xs">
                      {getMediaIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/50 rounded px-2 py-1">
                      <div className="text-white text-xs">
                        {formatDuration(item.duration)}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleAddToTimeline(item);
                      }}
                      className="p-1 bg-black/50 rounded text-white hover:bg-neon-cyan/50 transition-colors"
                      title="Add to timeline"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        removeMediaItem(item.id);
                      }}
                      className="p-1 bg-black/50 rounded text-white hover:bg-destructive/50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* List View Content */}
                {viewMode === "list" && (
                  <div className="absolute inset-0 flex items-center justify-between px-3">
                    <div className="flex items-center gap-3">
                      {getMediaIcon(item.type)}
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.duration &&
                            `${formatDuration(item.duration)} • `}
                          {item.size && formatFileSize(item.size)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drag Instructions */}
      {draggedItem && (
        <div className="mt-4 p-3 bg-neon-cyan/10 border border-neon-cyan rounded-lg">
          <div className="text-sm text-neon-cyan">
            Drag to timeline to add media
          </div>
        </div>
      )}
    </div>
  );
}
