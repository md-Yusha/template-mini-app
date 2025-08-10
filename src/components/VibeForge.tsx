"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  Share,
  Plus,
  Type,
  Image,
  Video,
  Music,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import { VideoPlayer } from "./VideoPlayer";
import { FileUpload } from "./FileUpload";
import { Timeline } from "./Timeline";
import { AIPanel } from "./AIPanel";
import { VideoEffects } from "./VideoEffects";
import { TextOverlay } from "./TextOverlay";
import { cn } from "~/lib/utils";

type TabType = "upload" | "timeline" | "ai" | "effects" | "text" | "audio";

export function VibeForge() {
  const {
    currentProject,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    createNewProject,
  } = useVibeForgeStore();

  const [activeTab, setActiveTab] = useState<TabType>("upload");

  // Create a new project on mount if none exists
  useEffect(() => {
    if (!currentProject) {
      createNewProject();
    }
  }, [currentProject, createNewProject]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 5));
  };

  const handleSkipForward = () => {
    const maxDuration = currentProject?.duration || 60;
    setCurrentTime(Math.min(maxDuration, currentTime + 5));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const tabs = [
    { id: "upload", label: "Upload", icon: Plus },
    { id: "timeline", label: "Timeline", icon: Video },
    { id: "ai", label: "AI Tools", icon: Image },
    { id: "effects", label: "Effects", icon: Settings },
    { id: "text", label: "Text", icon: Type },
    { id: "audio", label: "Audio", icon: Music },
  ];

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="glass-panel border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-neon-cyan">VibeForge</h1>
            <span className="text-sm text-muted-foreground">
              AI-powered onchain video editor
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Project Info */}
            <div className="text-sm">
              <div className="font-medium">
                {currentProject?.name || "Untitled Project"}
              </div>
              <div className="text-muted-foreground">
                {currentProject?.tracks.length || 0} tracks
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayPause}
                className="cyberpunk-btn p-2 rounded-lg"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={handleSkipBack}
                className="cyberpunk-btn p-2 rounded-lg"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleSkipForward}
                className="cyberpunk-btn p-2 rounded-lg"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <div className="text-sm text-muted-foreground ml-2">
                {formatTime(currentTime)} /{" "}
                {formatTime(currentProject?.duration || 60)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="cyberpunk-btn px-3 py-2 rounded-lg text-sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
              <button className="cyberpunk-btn px-3 py-2 rounded-lg text-sm">
                <Share className="w-4 h-4 mr-1" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Video Preview */}
        <div className="flex-1 p-4">
          <div className="h-full glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-neon-cyan" />
              <h2 className="text-neon-cyan text-xl font-bold">
                Canvas Preview
              </h2>
            </div>
            <VideoPlayer />
          </div>
        </div>

        {/* Right Panel - Tools */}
        <div className="lg:w-96 glass-panel rounded-xl p-4">
          <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-neon-cyan text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "upload" && <FileUpload />}
              {activeTab === "timeline" && <Timeline />}
              {activeTab === "ai" && <AIPanel />}
              {activeTab === "effects" && <VideoEffects />}
              {activeTab === "text" && <TextOverlay />}
              {activeTab === "audio" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-neon-cyan" />
                    <h3 className="text-neon-cyan text-lg font-bold">
                      Audio Tools
                    </h3>
                  </div>
                  <div className="text-muted-foreground">
                    Audio editing features coming soon...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Timeline */}
      <div className="h-64 glass-panel border-t border-border p-4">
        <Timeline />
      </div>
    </div>
  );
}
