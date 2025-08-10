"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sliders,
  Sun,
  Contrast,
  Palette,
  Eye,
  RotateCw,
  Download,
  Play,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import { cn } from "~/lib/utils";

interface VideoEffect {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "brightness" | "contrast" | "saturation" | "blur" | "rotation";
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

const videoEffects: VideoEffect[] = [
  {
    id: "brightness",
    name: "Brightness",
    icon: Sun,
    type: "brightness",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
  },
  {
    id: "contrast",
    name: "Contrast",
    icon: Contrast,
    type: "contrast",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
  },
  {
    id: "saturation",
    name: "Saturation",
    icon: Palette,
    type: "saturation",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 0,
  },
  {
    id: "blur",
    name: "Blur",
    icon: Eye,
    type: "blur",
    min: 0,
    max: 20,
    step: 0.5,
    defaultValue: 0,
  },
  {
    id: "rotation",
    name: "Rotation",
    icon: RotateCw,
    type: "rotation",
    min: -180,
    max: 180,
    step: 1,
    defaultValue: 0,
  },
];

export function VideoEffects() {
  const { selectedClip, updateClip } = useVibeForgeStore();
  const [effects, setEffects] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEffectChange = (effectId: string, value: number) => {
    setEffects((prev) => ({
      ...prev,
      [effectId]: value,
    }));
  };

  const handleApplyEffects = async () => {
    if (!selectedClip) return;

    setIsProcessing(true);
    try {
      // In a real implementation, you would call the video processing API
      // For now, we'll just update the clip with the effects
      const currentProject = useVibeForgeStore.getState().currentProject;
      if (!currentProject) return;

      // Find the track and clip
      for (const track of currentProject.tracks) {
        const clipIndex = track.clips.findIndex((c) => c.id === selectedClip);
        if (clipIndex !== -1) {
          updateClip(track.id, selectedClip, {
            effects: {
              brightness: effects.brightness,
              contrast: effects.contrast,
              saturation: effects.saturation,
              blur: effects.blur,
            },
          });
          break;
        }
      }
    } catch (error) {
      console.error("Failed to apply effects:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetEffects = () => {
    setEffects({});
  };

  const handlePreviewEffects = () => {
    // In a real implementation, you would preview the effects in real-time
    console.log("Previewing effects:", effects);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sliders className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-neon-cyan text-lg font-bold">Video Effects</h3>
      </div>

      {!selectedClip ? (
        <div className="text-center text-muted-foreground py-8">
          <Sliders className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Select a clip to apply effects</p>
        </div>
      ) : (
        <>
          {/* Effects Controls */}
          <div className="space-y-4">
            {videoEffects.map((effect) => (
              <motion.div
                key={effect.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <effect.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{effect.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {effects[effect.id] || effect.defaultValue}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={effect.min}
                    max={effect.max}
                    step={effect.step}
                    value={effects[effect.id] || effect.defaultValue}
                    onChange={(e) =>
                      handleEffectChange(effect.id, parseFloat(e.target.value))
                    }
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, var(--neon-cyan) 0%, var(--neon-cyan) ${
                        (((effects[effect.id] || effect.defaultValue) -
                          effect.min) /
                          (effect.max - effect.min)) *
                        100
                      }%, var(--secondary) ${
                        (((effects[effect.id] || effect.defaultValue) -
                          effect.min) /
                          (effect.max - effect.min)) *
                        100
                      }%, var(--secondary) 100%)`,
                    }}
                  />
                  <button
                    onClick={() =>
                      handleEffectChange(effect.id, effect.defaultValue)
                    }
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handlePreviewEffects}
              className="cyberpunk-btn flex-1 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Preview
            </button>

            <button
              onClick={handleApplyEffects}
              disabled={isProcessing}
              className={cn(
                "cyberpunk-btn flex-1 py-2 rounded-lg flex items-center justify-center gap-2",
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              <Download className="w-4 h-4" />
              {isProcessing ? "Applying..." : "Apply"}
            </button>
          </div>

          <button
            onClick={handleResetEffects}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Reset All Effects
          </button>
        </>
      )}
    </div>
  );
}
