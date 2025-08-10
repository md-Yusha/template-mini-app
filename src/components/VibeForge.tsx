"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Video,
  Folder,
  Upload,
  Sparkles,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import { VideoPlayer } from "./VideoPlayer";
import { FileUpload } from "./FileUpload";
import { Timeline } from "./Timeline";
import { AIPanel } from "./AIPanel";
import { MediaArea } from "./MediaArea";
import { cn } from "~/lib/utils";

type TabType = "upload" | "media" | "ai" | "timeline";

export function VibeForge() {
  const {
    currentProject,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    createNewProject,
  } = useVibeForgeStore();

  const [activeTab, setActiveTab] = useState<TabType>("media");

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
    { id: "upload", label: "Upload", icon: Upload },
    { id: "media", label: "Media", icon: Folder },
    { id: "ai", label: "AI", icon: Sparkles },
    { id: "timeline", label: "Timeline", icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "upload":
        return <FileUpload />;
      case "media":
        return <MediaArea />;
      case "ai":
        return <AIPanel />;
      case "timeline":
        return <Timeline />;
      default:
        return <MediaArea />;
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Mobile Header */}
      <header className="bg-card border-b border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-neon-cyan">VibeForge</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              AI video editor
            </span>
          </div>

          {/* Mobile Playback Controls */}
          <div className="flex items-center gap-1">
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
          </div>
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-muted-foreground">
            {formatTime(currentTime)} /{" "}
            {formatTime(currentProject?.duration || 60)}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentProject?.tracks.length || 0} tracks
          </div>
        </div>
      </header>

      {/* Pinned Video Preview */}
      <div className="h-48 bg-card border-b border-border p-3">
        <div className="flex items-center gap-2 mb-2">
          <Video className="w-4 h-4 text-neon-cyan" />
          <h2 className="text-neon-cyan text-sm font-bold">Preview</h2>
        </div>
        <div className="h-full">
          <VideoPlayer />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">{renderTabContent()}</div>

      {/* Mobile Bottom Navigation */}
      <nav className="bg-card border-t border-border p-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1",
                activeTab === tab.id
                  ? "bg-neon-cyan text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
