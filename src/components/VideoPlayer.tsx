"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
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
  const [showControls, setShowControls] = useState(true);
  const [currentMedia, setCurrentMedia] = useState<{
    type: "video" | "image" | "text" | "audio";
    source: string;
    content?: string;
  } | null>(null);

  // Memoize current playing media to reduce re-renders
  const currentPlayingMedia = useMemo(() => {
    if (!currentProject) return null;

    // Find the current playing clip
    for (const track of currentProject.tracks) {
      for (const clip of track.clips) {
        if (
          currentTime >= clip.position &&
          currentTime < clip.position + clip.duration
        ) {
          return {
            type: clip.type,
            source: clip.source,
            content: clip.text?.content,
          };
        }
      }
    }
    return null;
  }, [currentProject, currentTime]);

  // Update current media only when it actually changes
  useEffect(() => {
    if (currentPlayingMedia !== currentMedia) {
      setCurrentMedia(currentPlayingMedia);
    }
  }, [currentPlayingMedia, currentMedia]);

  // Optimized video sync with throttling
  const syncVideoTime = useCallback(() => {
    if (videoRef.current && currentMedia?.type === "video") {
      const clip = currentProject?.tracks
        .flatMap((t) => t.clips)
        .find((c) => c.source === currentMedia.source);

      if (clip) {
        const videoTime = currentTime - clip.position;
        const timeDiff = Math.abs(videoRef.current.currentTime - videoTime);

        // Only update if difference is significant (more than 0.1 seconds)
        if (timeDiff > 0.1) {
          videoRef.current.currentTime = videoTime;
        }
      }
    }
  }, [currentTime, currentMedia, currentProject]);

  // Throttled video sync
  useEffect(() => {
    const timeoutId = setTimeout(syncVideoTime, 50); // 50ms throttle
    return () => clearTimeout(timeoutId);
  }, [syncVideoTime]);

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

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && currentMedia?.type === "video") {
      const clip = currentProject?.tracks
        .flatMap((t) => t.clips)
        .find((c) => c.source === currentMedia.source);

      if (clip) {
        const newTime = clip.position + videoRef.current.currentTime;
        setCurrentTime(newTime);
      }
    }
  }, [currentMedia, currentProject, setCurrentTime]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  }, [isMuted]);

  const renderMediaContent = useMemo(() => {
    if (!currentMedia) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <Film className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No video loaded
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload media or generate content with AI to get started.
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
            preload="metadata"
            playsInline
          />
        );

      case "image":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <ImageIcon className="w-8 h-8 text-neon-cyan mb-2" />
            <img
              src={currentMedia.source}
              alt="Timeline image"
              className="max-w-full max-h-full object-contain rounded-lg"
              loading="lazy"
            />
          </div>
        );

      case "text":
        return (
          <div className="flex flex-col items-center justify-center h-full p-4">
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
          <div className="flex flex-col items-center justify-center h-full p-4">
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
  }, [currentMedia, handleTimeUpdate, isMuted, setIsPlaying]);

  return (
    <div className="h-full flex flex-col bg-black rounded-lg overflow-hidden">
      {/* Media Display */}
      <div className="flex-1 relative group">
        {renderMediaContent}

        {/* Mobile-friendly overlay controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
        />

        {/* Top Controls - Simplified for mobile */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Center Play Button - Larger for mobile */}
        {currentMedia?.type === "video" && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center group-hover:opacity-100 opacity-0 transition-opacity"
          >
            <div className="p-6 bg-black/50 rounded-full">
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white" />
              ) : (
                <Play className="w-12 h-12 text-white ml-1" />
              )}
            </div>
          </button>
        )}

        {/* Bottom Controls - Simplified for mobile */}
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center justify-between">
            {/* Play/Pause for video */}
            {currentMedia?.type === "video" && (
              <button
                onClick={handlePlayPause}
                className="p-3 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Volume - Simplified */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMuteToggle}
                className="p-3 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Media Type Indicator */}
            {currentMedia && (
              <div className="flex items-center gap-1 text-white text-xs bg-black/50 px-2 py-1 rounded">
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
