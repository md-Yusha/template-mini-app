"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Type, Plus, Trash2, Save } from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import { cn } from "~/lib/utils";

interface TextOverlayItem {
  id: string;
  content: string;
  font: string;
  size: number;
  color: string;
  position: { x: number; y: number };
  duration: number;
  startTime: number;
}

const fontOptions = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Impact",
  "Comic Sans MS",
];

const colorOptions = [
  "#ffffff", // White
  "#000000", // Black
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
  "#ff6b35", // Orange
  "#ff4dd2", // Pink
];

export function TextOverlay() {
  const { selectedClip } = useVibeForgeStore();
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [isAddingText, setIsAddingText] = useState(false);

  const [newText, setNewText] = useState({
    content: "",
    font: "Arial",
    size: 24,
    color: "#ffffff",
    position: { x: 50, y: 50 },
    duration: 5,
    startTime: 0,
  });

  const handleAddText = () => {
    if (!newText.content.trim()) return;

    const textItem: TextOverlayItem = {
      id: `text-${Date.now()}`,
      ...newText,
    };

    setTextOverlays([...textOverlays, textItem]);
    setNewText({
      content: "",
      font: "Arial",
      size: 24,
      color: "#ffffff",
      position: { x: 50, y: 50 },
      duration: 5,
      startTime: 0,
    });
    setIsAddingText(false);
  };

  const handleRemoveText = (id: string) => {
    setTextOverlays(textOverlays.filter((text) => text.id !== id));
    if (selectedText === id) {
      setSelectedText(null);
    }
  };

  const handleUpdateText = (id: string, updates: Partial<TextOverlayItem>) => {
    setTextOverlays(
      textOverlays.map((text) =>
        text.id === id ? { ...text, ...updates } : text
      )
    );
  };

  const handleApplyToTimeline = () => {
    if (!selectedClip) return;

    const currentProject = useVibeForgeStore.getState().currentProject;
    if (!currentProject) return;

    // Find the track and clip
    for (const track of currentProject.tracks) {
      const clipIndex = track.clips.findIndex((c) => c.id === selectedClip);
      if (clipIndex !== -1) {
        // Add text overlays to the clip
        const textClips = textOverlays.map((text) => ({
          id: `text-clip-${text.id}`,
          type: "text" as const,
          source: "",
          startTime: text.startTime,
          duration: text.duration,
          track: currentProject.tracks.findIndex((t) => t.id === track.id),
          position: text.startTime,
          volume: 1,
          text: {
            content: text.content,
            font: text.font,
            size: text.size,
            color: text.color,
            position: text.position,
          },
        }));

        // Add text clips to the overlay track
        const overlayTrack = currentProject.tracks.find(
          (t) => t.type === "overlay"
        );
        if (overlayTrack) {
          textClips.forEach((clip) => {
            useVibeForgeStore.getState().addClip(overlayTrack.id, clip);
          });
        }

        break;
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Type className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-neon-cyan text-lg font-bold">Text Overlay</h3>
      </div>

      {/* Add Text Button */}
      <button
        onClick={() => setIsAddingText(!isAddingText)}
        className="cyberpunk-btn w-full py-2 rounded-lg flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Text
      </button>

      {/* Add Text Form */}
      {isAddingText && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 bg-secondary rounded-lg space-y-3"
        >
          <div>
            <label className="text-sm font-medium text-foreground">
              Text Content:
            </label>
            <textarea
              value={newText.content}
              onChange={(e) =>
                setNewText({ ...newText, content: e.target.value })
              }
              placeholder="Enter your text here..."
              className="w-full p-2 bg-background border border-border rounded text-foreground resize-none"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">
                Font:
              </label>
              <select
                value={newText.font}
                onChange={(e) =>
                  setNewText({ ...newText, font: e.target.value })
                }
                className="w-full p-2 bg-background border border-border rounded text-foreground"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Size:
              </label>
              <input
                type="range"
                min="12"
                max="72"
                value={newText.size}
                onChange={(e) =>
                  setNewText({ ...newText, size: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">
                {newText.size}px
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Color:
            </label>
            <div className="flex gap-2 mt-1">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewText({ ...newText, color })}
                  className={cn(
                    "w-6 h-6 rounded border-2",
                    newText.color === color
                      ? "border-neon-cyan"
                      : "border-border"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">
                Start Time (s):
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={newText.startTime}
                onChange={(e) =>
                  setNewText({
                    ...newText,
                    startTime: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 bg-background border border-border rounded text-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Duration (s):
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={newText.duration}
                onChange={(e) =>
                  setNewText({
                    ...newText,
                    duration: parseFloat(e.target.value),
                  })
                }
                className="w-full p-2 bg-background border border-border rounded text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddText}
              className="cyberpunk-btn flex-1 py-2 rounded-lg"
            >
              Add Text
            </button>
            <button
              onClick={() => setIsAddingText(false)}
              className="px-4 py-2 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Text Overlays List */}
      {textOverlays.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Text Overlays:
          </h4>
          {textOverlays.map((text) => (
            <motion.div
              key={text.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-3 bg-secondary rounded-lg border transition-colors",
                selectedText === text.id ? "border-neon-cyan" : "border-border"
              )}
              onClick={() => setSelectedText(text.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate">
                    {text.content}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveText(text.id);
                  }}
                  className="p-1 hover:bg-destructive/20 rounded text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Font: {text.font} | Size: {text.size}px
                </div>
                <div>
                  Color: <span style={{ color: text.color }}>■</span>{" "}
                  {text.color}
                </div>
                <div>
                  Time: {text.startTime}s - {text.startTime + text.duration}s
                </div>
              </div>

              {/* Quick Edit Options */}
              {selectedText === text.id && (
                <div className="mt-2 pt-2 border-t border-border space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={text.content}
                      onChange={(e) =>
                        handleUpdateText(text.id, { content: e.target.value })
                      }
                      className="flex-1 p-1 bg-background border border-border rounded text-xs"
                    />
                    <input
                      type="color"
                      value={text.color}
                      onChange={(e) =>
                        handleUpdateText(text.id, { color: e.target.value })
                      }
                      className="w-8 h-8 rounded border border-border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={text.size}
                      onChange={(e) =>
                        handleUpdateText(text.id, {
                          size: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      {text.size}px
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Apply to Timeline */}
      {textOverlays.length > 0 && (
        <button
          onClick={handleApplyToTimeline}
          className="cyberpunk-btn w-full py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Apply to Timeline
        </button>
      )}
    </div>
  );
}
