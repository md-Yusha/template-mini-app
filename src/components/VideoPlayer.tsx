"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
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
  Maximize2,
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
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-gray-900">
          <Film className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No video loaded
          </h3>
          <p className="text-sm text-gray-400">
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
            className="w-full h-full object-contain bg-black"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
            preload="metadata"
            playsInline
          />
        );

      case "image":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900">
            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
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
          <div className="flex flex-col items-center justify-center h-full bg-gray-900">
            <Type className="w-8 h-8 text-gray-400 mb-2" />
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-200 mb-2">
                Text Overlay
              </div>
              <div className="text-lg text-gray-300">
                {currentMedia.content || "No text content"}
              </div>
            </div>
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900">
            <Music className="w-16 h-16 text-gray-400 mb-4" />
            <div className="text-center">
              <div className="text-lg font-medium text-gray-300 mb-2">
                Audio Track
              </div>
              <div className="text-sm text-gray-400">
                {currentMedia.source ? "Audio playing..." : "No audio source"}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-gray-400">Unknown media type</div>
          </div>
        );
    }
  }, [currentMedia, handleTimeUpdate, isMuted, setIsPlaying]);

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden relative group">
      {/* Media Display */}
      <div className="flex-1 relative">
        {renderMediaContent}

        {/* Video Controls Overlay - Only show for video content */}
        {currentMedia?.type === "video" && (
          <>
            {/* Top Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowControls(!showControls)}
                className="p-2 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-2 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors backdrop-blur-sm">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Center Play Button */}
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="p-4 bg-black/60 rounded-full backdrop-blur-sm">
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </div>
            </button>

            {/* Bottom Controls */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-between bg-black/60 rounded-lg p-3 backdrop-blur-sm">
                {/* Play/Pause */}
                <button
                  onClick={handlePlayPause}
                  className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMuteToggle}
                    className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Media Type Indicator */}
                <div className="flex items-center gap-1 text-white text-xs">
                  <Film className="w-3 h-3" />
                  <span className="capitalize">Video</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Non-video content controls */}
        {currentMedia && currentMedia.type !== "video" && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 text-white text-xs bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
              {currentMedia.type === "image" && (
                <ImageIcon className="w-3 h-3" />
              )}
              {currentMedia.type === "text" && <Type className="w-3 h-3" />}
              {currentMedia.type === "audio" && <Music className="w-3 h-3" />}
              <span className="capitalize">{currentMedia.type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
