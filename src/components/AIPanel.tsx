"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Image,
  Video,
  Mic,
  Scissors,
  Plus,
  Loader2,
  Download,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import { generateAIContent, HUGGING_FACE_MODELS } from "~/lib/ai";
import { cn } from "~/lib/utils";

type AITool =
  | "text-to-image"
  | "image-to-video"
  | "background-removal"
  | "speech-to-text";

export function AIPanel() {
  const {
    aiPrompt,
    setAIPrompt,
    isGenerating,
    setIsGenerating,
    addAIGeneration,
    updateAIGeneration,
    aiGenerations,
    addMediaItem,
  } = useVibeForgeStore();
  const [selectedTool, setSelectedTool] = useState<AITool>("text-to-image");
  const [selectedModel, setSelectedModel] = useState<string>("Qwen/Qwen-Image");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const aiTools = [
    {
      id: "text-to-image",
      label: "Text to Image",
      icon: Image,
      description: "Generate images from text prompts",
      models: HUGGING_FACE_MODELS["text-to-image"],
    },
    {
      id: "image-to-video",
      label: "Image to Video",
      icon: Video,
      description: "Create videos from images with AI",
      models: HUGGING_FACE_MODELS["image-to-video"],
    },
    {
      id: "background-removal",
      label: "Remove Background",
      icon: Scissors,
      description: "Remove background from images",
      models: HUGGING_FACE_MODELS["background-removal"],
    },
    {
      id: "speech-to-text",
      label: "Speech to Text",
      icon: Mic,
      description: "Convert audio to text captions",
      models: HUGGING_FACE_MODELS["speech-to-text"],
    },
  ];

  const currentTool = aiTools.find((tool) => tool.id === selectedTool);

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationStatus("generating");
    setStatusMessage("Initializing AI generation...");

    const generationId = `gen-${Date.now()}`;

    // Add generation to store
    addAIGeneration({
      id: generationId,
      type: selectedTool,
      prompt: aiPrompt,
      status: "processing",
      timestamp: Date.now(),
    });

    try {
      setStatusMessage("Processing your request...");

      const result = await generateAIContent({
        type: selectedTool,
        prompt: aiPrompt,
        options: {
          model: selectedModel,
        },
      });

      if (result.success && result.data) {
        setGeneratedContent(result.data);
        setGenerationStatus("success");
        setStatusMessage("Generation completed successfully!");

        updateAIGeneration(generationId, {
          status: "completed",
          result: result.data,
        });

        // Automatically add to media library
        const mediaItem = {
          id: `ai-media-${Date.now()}`,
          type: (selectedTool.includes("image")
            ? "image"
            : selectedTool.includes("video")
            ? "video"
            : "text") as "video" | "audio" | "image" | "text",
          source: result.data,
          name: `AI Generated ${selectedTool.replace("-", " ")}`,
          thumbnail: selectedTool.includes("image") ? result.data : undefined,
          duration: selectedTool.includes("video") ? 10 : undefined,
          createdAt: Date.now(),
          tags: ["ai-generated", selectedTool],
        };

        addMediaItem(mediaItem);
        setStatusMessage("Added to media library!");
      } else {
        setGenerationStatus("error");
        setStatusMessage(result.error || "Generation failed");

        updateAIGeneration(generationId, {
          status: "error",
          error: result.error || "Generation failed",
        });
      }
    } catch (error) {
      setGenerationStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Unknown error"
      );

      updateAIGeneration(generationId, {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsGenerating(false);
      // Reset status after a delay
      setTimeout(() => {
        setGenerationStatus("idle");
        setStatusMessage("");
      }, 3000);
    }
  };

  const handleAddToTimeline = () => {
    if (!generatedContent) return;

    // Add the generated content to the timeline
    const currentProject = useVibeForgeStore.getState().currentProject;
    if (!currentProject) return;

    // Find the first video track or create one if needed
    let targetTrack = currentProject.tracks.find((t) => t.type === "video");
    if (!targetTrack) {
      targetTrack = currentProject.tracks[0]; // Use first available track
    }

    if (targetTrack) {
      const newClip = {
        id: `ai-generated-${Date.now()}`,
        type: (selectedTool.includes("image")
          ? "image"
          : selectedTool.includes("video")
          ? "video"
          : "text") as "video" | "audio" | "image" | "text",
        source: generatedContent,
        startTime: 0,
        duration: selectedTool.includes("image")
          ? 3
          : selectedTool.includes("video")
          ? 10
          : 5, // Default durations
        track: currentProject.tracks.findIndex((t) => t.id === targetTrack!.id),
        position: useVibeForgeStore.getState().currentTime,
        volume: 1,
      };

      useVibeForgeStore.getState().addClip(targetTrack.id, newClip);
      console.log("Added AI-generated content to timeline:", newClip);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;

    const link = document.createElement("a");
    link.href = generatedContent;
    link.download = `ai-generated-${selectedTool}-${Date.now()}.${
      selectedTool.includes("image") ? "png" : "mp4"
    }`;
    link.click();
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-neon-cyan" />
        <h2 className="text-neon-cyan text-lg font-bold">AI Assistant</h2>
      </div>

      {/* AI Tools Selection - Mobile optimized */}
      <div className="mb-4">
        <div className="text-sm font-medium text-foreground mb-3">
          Choose AI Tool:
        </div>
        <div className="grid grid-cols-2 gap-3">
          {aiTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id as AITool);
                setSelectedModel(Object.keys(tool.models)[0] || "");
              }}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 text-left",
                selectedTool === tool.id
                  ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                  : "border-border hover:border-neon-cyan/50"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <tool.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tool.label}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {tool.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      {currentTool && (
        <div className="mb-4">
          <div className="text-sm font-medium text-foreground mb-2">
            AI Model:
          </div>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-3 bg-secondary border border-border rounded-lg text-foreground focus:border-neon-cyan focus:outline-none text-sm"
          >
            {Object.keys(currentTool.models).map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
          <div className="text-xs text-muted-foreground mt-1">
            Using: {selectedModel}
          </div>
        </div>
      )}

      {/* Advanced Options */}
      <div className="mb-4">
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4" />
          Advanced Options
        </button>

        {showAdvancedOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 p-3 bg-secondary rounded-lg space-y-2"
          >
            <div className="text-xs text-muted-foreground">
              <div>
                • Text-to-Image: Supports 512x512 and 1024x1024 resolutions
              </div>
              <div>• Image-to-Video: Configurable duration and frame count</div>
              <div>• Background Removal: High-quality background removal</div>
              <div>• Speech-to-Text: Multi-language support</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <div className="text-sm font-medium text-foreground mb-2">Ask me:</div>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAIPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          className="w-full h-24 p-3 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground resize-none focus:border-neon-cyan focus:outline-none"
          disabled={isGenerating}
        />
      </div>

      {/* Status Message */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mb-4 p-3 rounded-lg flex items-center gap-2 text-sm",
            generationStatus === "success"
              ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
              : generationStatus === "error"
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
          )}
        >
          {generationStatus === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : generationStatus === "error" ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {statusMessage}
        </motion.div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !aiPrompt.trim()}
        className={cn(
          "cyberpunk-btn w-full py-4 rounded-lg mb-4 flex items-center justify-center gap-2 text-base",
          isGenerating ? "opacity-50 cursor-not-allowed" : ""
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate
          </>
        )}
      </button>

      {/* Generated Content */}
      {generatedContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col"
        >
          <div className="text-sm font-medium text-foreground mb-2">
            Generated Result:
          </div>

          <div className="flex-1 bg-secondary rounded-lg overflow-hidden mb-3">
            {selectedTool.includes("image") ? (
              <img
                src={generatedContent}
                alt="AI Generated"
                className="w-full h-full object-cover"
              />
            ) : selectedTool.includes("video") ? (
              <video
                src={generatedContent}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-4 text-foreground">
                <div className="font-medium mb-2">Transcription:</div>
                <div className="text-sm">{generatedContent}</div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToTimeline}
              className="cyberpunk-btn flex-1 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Timeline
            </button>

            <button
              onClick={handleDownload}
              className="cyberpunk-btn px-4 py-3 rounded-lg"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Recent Generations */}
      {aiGenerations.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-foreground mb-2">
            Recent Generations:
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {aiGenerations.slice(0, 3).map((gen) => (
              <div
                key={gen.id}
                className={cn(
                  "p-2 rounded-lg text-xs",
                  gen.status === "completed"
                    ? "bg-neon-green/10 text-neon-green"
                    : gen.status === "error"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <div className="font-medium">{gen.type}</div>
                <div className="truncate">{gen.prompt}</div>
                {gen.status === "processing" && (
                  <div className="flex items-center gap-1 mt-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
