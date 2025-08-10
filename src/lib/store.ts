import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Clip {
  id: string;
  type: "video" | "audio" | "image" | "text";
  source: string;
  startTime: number;
  duration: number;
  track: number;
  position: number;
  volume?: number;
  effects?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
  };
  text?: {
    content: string;
    font: string;
    size: number;
    color: string;
    position: { x: number; y: number };
  };
}

export interface Track {
  id: string;
  type: "video" | "audio" | "overlay";
  name: string;
  clips: Clip[];
  muted: boolean;
  volume: number;
}

export interface AIGeneration {
  id: string;
  type:
    | "text-to-image"
    | "image-to-video"
    | "background-removal"
    | "speech-to-text";
  prompt: string;
  status: "pending" | "processing" | "completed" | "error";
  result?: string;
  error?: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  tracks: Track[];
  duration: number;
  resolution: { width: number; height: number };
  fps: number;
  createdAt: number;
  updatedAt: number;
}

interface VibeForgeState {
  // Project State
  currentProject: Project | null;
  projects: Project[];

  // Timeline State
  currentTime: number;
  zoom: number;
  selectedClip: string | null;
  isPlaying: boolean;

  // AI State
  aiGenerations: AIGeneration[];
  aiPrompt: string;
  isGenerating: boolean;

  // UI State
  activePanel: "timeline" | "ai" | "export" | "settings";
  sidebarOpen: boolean;

  // Actions
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;

  // Timeline Actions
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedClip: (clipId: string | null) => void;
  setIsPlaying: (playing: boolean) => void;

  // Track Actions
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;

  // Clip Actions
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (trackId: string, clipId: string) => void;
  updateClip: (trackId: string, clipId: string, updates: Partial<Clip>) => void;
  moveClip: (
    clipId: string,
    fromTrackId: string,
    toTrackId: string,
    newPosition: number
  ) => void;

  // AI Actions
  addAIGeneration: (generation: AIGeneration) => void;
  updateAIGeneration: (id: string, updates: Partial<AIGeneration>) => void;
  setAIPrompt: (prompt: string) => void;
  setIsGenerating: (generating: boolean) => void;

  // UI Actions
  setActivePanel: (panel: "timeline" | "ai" | "export" | "settings") => void;
  setSidebarOpen: (open: boolean) => void;

  // Utility Actions
  createNewProject: () => void;
  exportProject: () => Promise<string>;
  importProject: (projectData: string) => void;
}

const defaultProject: Project = {
  id: "default",
  name: "Untitled Project",
  tracks: [
    {
      id: "video-track-1",
      type: "video",
      name: "Video Track 1",
      clips: [],
      muted: false,
      volume: 1,
    },
    {
      id: "audio-track-1",
      type: "audio",
      name: "Audio Track 1",
      clips: [],
      muted: false,
      volume: 1,
    },
    {
      id: "overlay-track-1",
      type: "overlay",
      name: "Overlay Track 1",
      clips: [],
      muted: false,
      volume: 1,
    },
  ],
  duration: 60,
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const useVibeForgeStore = create<VibeForgeState>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentProject: null,
      projects: [],
      currentTime: 0,
      zoom: 1,
      selectedClip: null,
      isPlaying: false,
      aiGenerations: [],
      aiPrompt: "",
      isGenerating: false,
      activePanel: "timeline",
      sidebarOpen: true,

      // Project Actions
      setCurrentProject: (project) => set({ currentProject: project }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      updateProject: (projectId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
          currentProject:
            state.currentProject?.id === projectId
              ? { ...state.currentProject, ...updates, updatedAt: Date.now() }
              : state.currentProject,
        })),

      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
          currentProject:
            state.currentProject?.id === projectId
              ? null
              : state.currentProject,
        })),

      // Timeline Actions
      setCurrentTime: (time) => set({ currentTime: time }),
      setZoom: (zoom) => set({ zoom }),
      setSelectedClip: (clipId) => set({ selectedClip: clipId }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),

      // Track Actions
      addTrack: (track) =>
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              tracks: [...state.currentProject.tracks, track],
              updatedAt: Date.now(),
            },
          };
        }),

      removeTrack: (trackId) =>
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              tracks: state.currentProject.tracks.filter(
                (t) => t.id !== trackId
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      updateTrack: (trackId, updates) =>
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              tracks: state.currentProject.tracks.map((t) =>
                t.id === trackId ? { ...t, ...updates } : t
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      // Clip Actions
      addClip: (trackId, clip) =>
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              tracks: state.currentProject.tracks.map((t) =>
                t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      removeClip: (trackId, clipId) =>
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              tracks: state.currentProject.tracks.map((t) =>
                t.id === trackId
                  ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) }
                  : t
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      updateClip: (trackId, clipId, updates) =>
        set((state) => {
          if (!state.currentProject) return state;
          return {
            currentProject: {
              ...state.currentProject,
              tracks: state.currentProject.tracks.map((t) =>
                t.id === trackId
                  ? {
                      ...t,
                      clips: t.clips.map((c) =>
                        c.id === clipId ? { ...c, ...updates } : c
                      ),
                    }
                  : t
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      moveClip: (clipId, fromTrackId, toTrackId, newPosition) =>
        set((state) => {
          if (!state.currentProject) return state;

          const fromTrack = state.currentProject.tracks.find(
            (t) => t.id === fromTrackId
          );
          const clip = fromTrack?.clips.find((c) => c.id === clipId);

          if (!clip) return state;

          return {
            currentProject: {
              ...state.currentProject,
              tracks: state.currentProject.tracks.map((t) => {
                if (t.id === fromTrackId) {
                  return {
                    ...t,
                    clips: t.clips.filter((c) => c.id !== clipId),
                  };
                }
                if (t.id === toTrackId) {
                  return {
                    ...t,
                    clips: [...t.clips, { ...clip, position: newPosition }],
                  };
                }
                return t;
              }),
              updatedAt: Date.now(),
            },
          };
        }),

      // AI Actions
      addAIGeneration: (generation) =>
        set((state) => ({
          aiGenerations: [generation, ...state.aiGenerations],
        })),

      updateAIGeneration: (id, updates) =>
        set((state) => ({
          aiGenerations: state.aiGenerations.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),

      setAIPrompt: (prompt) => set({ aiPrompt: prompt }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),

      // UI Actions
      setActivePanel: (panel) => set({ activePanel: panel }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Utility Actions
      createNewProject: () => {
        const newProject: Project = {
          ...defaultProject,
          id: `project-${Date.now()}`,
          name: `Project ${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          currentProject: newProject,
          projects: [newProject, ...state.projects],
        }));
      },

      exportProject: async () => {
        const { currentProject } = get();
        if (!currentProject) throw new Error("No project to export");
        return JSON.stringify(currentProject);
      },

      importProject: (projectData) => {
        try {
          const project: Project = JSON.parse(projectData);
          set((state) => ({
            currentProject: project,
            projects: [project, ...state.projects],
          }));
        } catch (error) {
          console.error("Failed to import project:", error);
        }
      },
    }),
    {
      name: "vibeforge-store",
    }
  )
);
