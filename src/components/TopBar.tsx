"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Settings,
  Download,
  Upload,
  Save,
  FolderOpen,
  Menu,
} from "lucide-react";
import { useVibeForgeStore } from "~/lib/store";
import { cn } from "~/lib/utils";

export function TopBar() {
  const { currentProject, exportProject } = useVibeForgeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleExport = async () => {
    try {
      const projectData = await exportProject();
      const blob = new Blob([projectData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentProject?.name || "project"}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export project:", error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Import project logic would go here
        console.log("Importing project:", content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl mx-4 mt-4 p-4"
    >
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-neon-cyan text-2xl font-bold"
          >
            VibeForge
          </motion.div>
          <div className="text-muted-foreground text-sm">
            AI-powered onchain video editor
          </div>
        </div>

        {/* Project Info */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-foreground font-medium">
              {currentProject?.name || "Untitled Project"}
            </div>
            <div className="text-muted-foreground text-xs">
              {currentProject?.tracks.length || 0} tracks
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Project Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="cyberpunk-btn px-3 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <Menu className="w-4 h-4" />
              Project
            </button>

            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-lg p-2 z-50"
              >
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      // New project logic
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    New Project
                  </button>

                  <label className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import Project
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      handleExport();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Project
                  </button>

                  <button
                    onClick={() => {
                      // Save project logic
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Project
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Wallet Connect */}
          <button
            onClick={() => setIsWalletConnected(!isWalletConnected)}
            className={cn(
              "cyberpunk-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2",
              isWalletConnected ? "bg-neon-green" : "bg-neon-magenta"
            )}
          >
            <Wallet className="w-4 h-4" />
            {isWalletConnected ? "Connected" : "Connect Wallet"}
          </button>

          {/* Settings */}
          <button className="cyberpunk-btn px-3 py-2 rounded-lg text-sm">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </motion.div>
  );
}
