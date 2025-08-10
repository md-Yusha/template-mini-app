"use client";

import dynamic from "next/dynamic";

// note: dynamic import is required for components that use the Frame SDK
const VibeForge = dynamic(
  () =>
    import("~/components/VibeForge").then((mod) => ({
      default: mod.VibeForge,
    })),
  {
    ssr: false,
  }
);

export default function App() {
  return <VibeForge />;
}
