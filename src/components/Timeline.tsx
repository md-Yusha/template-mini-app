"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import { cn } from "~/lib/utils";

export function Timeline() {
  const {
    currentProject,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    selectedClip,
    setSelectedClip,
    addTrack,
    addClip,
    removeClip,
    copyClip,
    pasteClip,
    moveClip,
    mediaLibrary,
  } = useVibeForgeStore();

  const [zoom] = useState(1);
  const [draggedClip, setDraggedClip] = useState<string | null>(null);
  const [dragOverTrack, setDragOverTrack] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const tracks = currentProject?.tracks || [];

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        const newTime = currentTime + 0.1; // 100ms intervals
        const maxDuration = currentProject?.duration || 60;
        if (newTime >= maxDuration) {
          setIsPlaying(false);
          setCurrentTime(0);
        } else {
          setCurrentTime(newTime);
        }
      }, 100);
    } else {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [
    isPlaying,
    currentTime,
    setCurrentTime,
    setIsPlaying,
    currentProject?.duration,
  ]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const newTime = (clickX / timelineWidth) * (currentProject?.duration || 60);

    setCurrentTime(
      Math.max(0, Math.min(newTime, currentProject?.duration || 60))
    );
  };

  const handleAddTrack = () => {
    const newTrack = {
      id: `track-${Date.now()}`,
      type: "video" as const,
      name: `Track ${tracks.length + 1}`,
      clips: [],
      muted: false,
      volume: 1,
    };
    addTrack(newTrack);
  };

  const handleAddClip = (trackId: string) => {
    const newClip = {
      id: `clip-${Date.now()}`,
      type: "video" as const,
      source: "",
      startTime: currentTime,
      duration: 5,
      track: tracks.findIndex((t) => t.id === trackId),
      position: currentTime,
      volume: 1,
    };
    addClip(trackId, newClip);
  };

  const handleRemoveClip = (trackId: string, clipId: string) => {
    removeClip(trackId, clipId);
    if (selectedClip === clipId) {
      setSelectedClip(null);
    }
  };

  const handleCopyClip = (clipId: string) => {
    copyClip(clipId);
  };

  const handlePasteClip = (trackId: string) => {
    const rect = timelineRef.current?.getBoundingClientRect();
    if (rect) {
      const pastePosition = currentTime;
      pasteClip(trackId, pastePosition);
    }
  };

  const handleClipDragStart = (e: React.DragEvent, clipId: string) => {
    setDraggedClip(clipId);
    e.dataTransfer.setData("text/plain", clipId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClipDragEnd = () => {
    setDraggedClip(null);
    setDragOverTrack(null);
  };

  const handleTrackDragOver = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTrack(trackId);
  };

  const handleTrackDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const clipId = e.dataTransfer.getData("text/plain");

    // Check if it's a media item from the media library
    const mediaItem = mediaLibrary.find((item) => item.id === clipId);
    if (mediaItem) {
      const newClip = {
        id: `clip-${Date.now()}`,
        type: mediaItem.type,
        source: mediaItem.source,
        startTime: 0,
        duration: mediaItem.duration || 5,
        track: tracks.findIndex((t) => t.id === trackId),
        position: currentTime,
        volume: 1,
      };
      addClip(trackId, newClip);
    } else {
      // It's an existing clip being moved
      const rect = timelineRef.current?.getBoundingClientRect();
      if (rect) {
        const dropX = e.clientX - rect.left;
        const newPosition =
          (dropX / rect.width) * (currentProject?.duration || 60);

        // Find the source track
        const sourceTrack = tracks.find((t) =>
          t.clips.some((c) => c.id === clipId)
        );

        if (sourceTrack && sourceTrack.id !== trackId) {
          moveClip(clipId, sourceTrack.id, trackId, newPosition);
        }
      }
    }

    setDragOverTrack(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTimeMarkers = () => {
    const duration = currentProject?.duration || 60;
    const markers = [];
    const interval = Math.max(1, Math.floor(duration / 10)); // Fewer markers for mobile

    for (let i = 0; i <= duration; i += interval) {
      markers.push(i);
    }

    return markers;
  };

  // Get current playing clip
  const getCurrentPlayingClip = () => {
    for (const track of tracks) {
      for (const clip of track.clips) {
        if (
          currentTime >= clip.position &&
          currentTime < clip.position + clip.duration
        ) {
          return { clip, track };
        }
      }
    }
    return null;
  };

  const currentPlayingClip = getCurrentPlayingClip();

  return (
    <div className="h-full flex flex-col p-4">
      {/* Timeline Header - Mobile optimized */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-neon-cyan text-lg font-bold">Timeline</h2>

          {/* Mobile Playback Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="cyberpunk-btn p-2 rounded-lg"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
              className="cyberpunk-btn p-2 rounded-lg"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                setCurrentTime(
                  Math.min(currentProject?.duration || 60, currentTime + 5)
                )
              }
              className="cyberpunk-btn p-2 rounded-lg"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddTrack}
            className="cyberpunk-btn px-3 py-2 rounded-lg text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Track
          </button>
        </div>
      </div>

      {/* Current Time Display */}
      <div className="text-sm text-muted-foreground mb-3">
        {formatTime(currentTime)} / {formatTime(currentProject?.duration || 60)}
      </div>

      {/* Timeline Ruler - Mobile optimized */}
      <div className="h-10 bg-secondary rounded-lg mb-3 relative overflow-hidden">
        <div className="flex h-full">
          {getTimeMarkers().map((time) => (
            <div
              key={time}
              className="flex-1 border-r border-border relative"
              style={{ minWidth: `${zoom * 40}px` }}
            >
              <div className="absolute top-1 left-1 text-xs text-muted-foreground">
                {formatTime(time)}
              </div>
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-neon-cyan z-10"
          style={{
            left: `${(currentTime / (currentProject?.duration || 60)) * 100}%`,
          }}
        />
      </div>

      {/* Timeline Tracks - Mobile optimized */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={timelineRef}
          className="relative"
          onClick={handleTimelineClick}
        >
          {tracks.map((track) => (
            <div
              key={track.id}
              className={cn(
                "timeline-track h-16 mb-2 rounded-lg relative transition-all",
                selectedClip && track.clips.some((c) => c.id === selectedClip)
                  ? "ring-2 ring-neon-cyan"
                  : dragOverTrack === track.id
                  ? "ring-2 ring-neon-green bg-neon-green/10"
                  : ""
              )}
              onDragOver={(e) => handleTrackDragOver(e, track.id)}
              onDrop={(e) => handleTrackDrop(e, track.id)}
            >
              {/* Track Header - Simplified for mobile */}
              <div className="absolute left-0 top-0 w-24 h-full bg-secondary border-r border-border rounded-l-lg flex items-center justify-between px-2">
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      track.type === "video"
                        ? "bg-neon-cyan"
                        : track.type === "audio"
                        ? "bg-neon-green"
                        : "bg-neon-magenta"
                    )}
                  />
                  <span className="text-xs font-medium truncate">
                    {track.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAddClip(track.id)}
                    className="p-1 hover:bg-primary/20 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handlePasteClip(track.id)}
                    className="p-1 hover:bg-primary/20 rounded"
                    title="Paste clip"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Track Content */}
              <div className="ml-24 h-full relative">
                {/* Clips */}
                {track.clips.map((clip) => {
                  const isPlaying = currentPlayingClip?.clip.id === clip.id;
                  const isInPlayhead =
                    currentTime >= clip.position &&
                    currentTime < clip.position + clip.duration;

                  return (
                    <div
                      key={clip.id}
                      className={cn(
                        "absolute top-1 bottom-1 rounded border-2 cursor-pointer transition-all",
                        selectedClip === clip.id
                          ? "border-neon-cyan bg-neon-cyan/20"
                          : isPlaying
                          ? "border-neon-green bg-neon-green/20"
                          : isInPlayhead
                          ? "border-neon-yellow bg-neon-yellow/20"
                          : draggedClip === clip.id
                          ? "border-neon-magenta bg-neon-magenta/20 opacity-50"
                          : "border-border bg-secondary hover:border-neon-cyan/50"
                      )}
                      style={{
                        left: `${
                          (clip.position / (currentProject?.duration || 60)) *
                          100
                        }%`,
                        width: `${
                          (clip.duration / (currentProject?.duration || 60)) *
                          100
                        }%`,
                      }}
                      draggable
                      onDragStart={(e: React.DragEvent) =>
                        handleClipDragStart(e, clip.id)
                      }
                      onDragEnd={handleClipDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClip(clip.id);
                      }}
                    >
                      <div className="h-full flex items-center justify-between px-2">
                        <div className="text-xs truncate">
                          {clip.type === "video"
                            ? "🎬"
                            : clip.type === "audio"
                            ? "🎵"
                            : clip.type === "image"
                            ? "🖼️"
                            : "📝"}{" "}
                          {clip.id}
                          {isPlaying && " ▶️"}
                        </div>

                        {selectedClip === clip.id && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleCopyClip(clip.id);
                              }}
                              className="p-1 hover:bg-primary/20 rounded"
                              title="Copy clip"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleRemoveClip(track.id, clip.id);
                              }}
                              className="p-1 hover:bg-destructive/20 rounded text-destructive"
                              title="Delete clip"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
