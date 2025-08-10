"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Film,
  Image as ImageIcon,
  Type,
  Music,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";

export function VideoPlayer() {
  const {
    currentProject,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
  } = useVibeForgeStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [currentMedia, setCurrentMedia] = useState<{
    type: "video" | "image" | "text" | "audio";
    source: string;
    content?: string;
  } | null>(null);

  // Get current playing media from timeline
  useEffect(() => {
    if (!currentProject) {
      setCurrentMedia(null);
      return;
    }

    // Find the current playing clip
    for (const track of currentProject.tracks) {
      for (const clip of track.clips) {
        if (
          currentTime >= clip.position &&
          currentTime < clip.position + clip.duration
        ) {
          setCurrentMedia({
            type: clip.type,
            source: clip.source,
            content: clip.text?.content,
          });
          return;
        }
      }
    }

    // If no clip is playing, show placeholder
    setCurrentMedia(null);
  }, [currentProject, currentTime]);

  // Sync video player with timeline
  useEffect(() => {
    if (videoRef.current && currentMedia?.type === "video") {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, currentMedia]);

  // Update video time when timeline changes
  useEffect(() => {
    if (videoRef.current && currentMedia?.type === "video") {
      const videoTime =
        currentTime -
        (currentProject?.tracks
          .flatMap((t) => t.clips)
          .find((c) => c.source === currentMedia.source)?.position || 0);

      if (Math.abs(videoRef.current.currentTime - videoTime) > 0.1) {
        videoRef.current.currentTime = videoTime;
      }
    }
  }, [currentTime, currentMedia, currentProject]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && currentMedia?.type === "video") {
      const clip = currentProject?.tracks
        .flatMap((t) => t.clips)
        .find((c) => c.source === currentMedia.source);

      if (clip) {
        const newTime = clip.position + videoRef.current.currentTime;
        setCurrentTime(newTime);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const renderMediaContent = () => {
    if (!currentMedia) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Film className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No video loaded
          </h3>
          <p className="text-sm text-muted-foreground">
            Import a video to get started.
          </p>
        </div>
      );
    }

    switch (currentMedia.type) {
      case "video":
        return (
          <video
            ref={videoRef}
            src={currentMedia.source}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
          />
        );

      case "image":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <ImageIcon className="w-8 h-8 text-neon-cyan mb-2" />
            <img
              src={currentMedia.source}
              alt="Timeline image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );

      case "text":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Type className="w-8 h-8 text-neon-cyan mb-2" />
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-cyan mb-2">
                Text Overlay
              </div>
              <div className="text-lg text-foreground">
                {currentMedia.content || "No text content"}
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <Music className="w-16 h-16 text-neon-cyan mb-4" />
            <div className="text-center">
              <div className="text-lg font-medium text-foreground mb-2">
                Audio Track
              </div>
              <div className="text-sm text-muted-foreground">
                {currentMedia.source ? "Audio playing..." : "No audio source"}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Unknown media type</div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Media Display */}
      <div className="flex-1 bg-black rounded-lg overflow-hidden relative group">
        {renderMediaContent()}

        {/* Overlay Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
        />

        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        {/* Center Play Button */}
        {currentMedia?.type === "video" && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center group-hover:opacity-100 opacity-0 transition-opacity"
          >
            <div className="p-4 bg-black/50 rounded-full">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </div>
          </button>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            {currentMedia?.type === "video" && (
              <button
                onClick={handlePlayPause}
                className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Time Display */}
            <div className="text-white text-sm">
              {formatTime(currentTime)} /{" "}
              {formatTime(currentProject?.duration || 60)}
            </div>

            {/* Media Type Indicator */}
            {currentMedia && (
              <div className="flex items-center gap-1 text-white text-xs">
                {currentMedia.type === "video" && <Film className="w-3 h-3" />}
                {currentMedia.type === "image" && (
                  <ImageIcon className="w-3 h-3" />
                )}
                {currentMedia.type === "text" && <Type className="w-3 h-3" />}
                {currentMedia.type === "audio" && <Music className="w-3 h-3" />}
                <span className="capitalize">{currentMedia.type}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
