"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Scissors,
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
    removeTrack,
    addClip,
    removeClip,
  } = useVibeForgeStore();

  const [zoom, setZoom] = useState(1);
  const [showWaveform, setShowWaveform] = useState(true);
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

  const handleRemoveTrack = (trackId: string) => {
    removeTrack(trackId);
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
    const interval = Math.max(1, Math.floor(duration / 20));

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
    <div className="h-full flex flex-col">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-neon-cyan text-xl font-bold">Timeline</h2>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
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

          {/* Current Time Display */}
          <div className="text-sm text-muted-foreground">
            {formatTime(currentTime)} /{" "}
            {formatTime(currentProject?.duration || 60)}
          </div>

          {/* Current Playing Clip Info */}
          {currentPlayingClip && (
            <div className="text-xs text-neon-green">
              Playing: {currentPlayingClip.clip.type} on{" "}
              {currentPlayingClip.track.name}
            </div>
          )}
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Zoom:</span>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-20 h-1 bg-secondary rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          <button
            onClick={() => setShowWaveform(!showWaveform)}
            className="cyberpunk-btn px-3 py-1 rounded-lg text-sm"
          >
            {showWaveform ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleAddTrack}
            className="cyberpunk-btn px-3 py-1 rounded-lg text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Track
          </button>
        </div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-8 bg-secondary rounded-lg mb-2 relative overflow-hidden">
        <div className="flex h-full">
          {getTimeMarkers().map((time) => (
            <div
              key={time}
              className="flex-1 border-r border-border relative"
              style={{ minWidth: `${zoom * 50}px` }}
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

      {/* Timeline Tracks */}
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
                "timeline-track h-16 mb-2 rounded-lg relative",
                selectedClip && track.clips.some((c) => c.id === selectedClip)
                  ? "ring-2 ring-neon-cyan"
                  : ""
              )}
            >
              {/* Track Header */}
              <div className="absolute left-0 top-0 w-32 h-full bg-secondary border-r border-border rounded-l-lg flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      track.type === "video"
                        ? "bg-neon-cyan"
                        : track.type === "audio"
                        ? "bg-neon-green"
                        : "bg-neon-magenta"
                    )}
                  />
                  <span className="text-sm font-medium truncate">
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
                    onClick={() => handleRemoveTrack(track.id)}
                    className="p-1 hover:bg-destructive/20 rounded text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Track Content */}
              <div className="ml-32 h-full relative">
                {/* Clips */}
                {track.clips.map((clip) => {
                  const isPlaying = currentPlayingClip?.clip.id === clip.id;
                  const isInPlayhead =
                    currentTime >= clip.position &&
                    currentTime < clip.position + clip.duration;

                  return (
                    <motion.div
                      key={clip.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "absolute top-1 bottom-1 rounded border-2 cursor-pointer transition-all",
                        selectedClip === clip.id
                          ? "border-neon-cyan bg-neon-cyan/20"
                          : isPlaying
                          ? "border-neon-green bg-neon-green/20"
                          : isInPlayhead
                          ? "border-neon-yellow bg-neon-yellow/20"
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
                      onClick={(e: React.MouseEvent) => {
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
                            : "📝"}{" "}
                          {clip.id}
                          {isPlaying && " ▶️"}
                        </div>

                        {selectedClip === clip.id && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                // Split clip logic
                              }}
                              className="p-1 hover:bg-primary/20 rounded"
                            >
                              <Scissors className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                // Copy clip logic
                              }}
                              className="p-1 hover:bg-primary/20 rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleRemoveClip(track.id, clip.id);
                              }}
                              className="p-1 hover:bg-destructive/20 rounded text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Waveform (placeholder) */}
                {showWaveform && track.type === "audio" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-8 flex items-end justify-center gap-px">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-neon-green/30 rounded-sm"
                          style={{
                            height: `${Math.random() * 100}%`,
                            width: "2px",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
