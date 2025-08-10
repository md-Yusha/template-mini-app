export const APP_URL = process.env.NEXT_PUBLIC_URL!;
export const APP_NAME = "VibeForge";
export const APP_DESCRIPTION = "AI-powered onchain video editor for Farcaster";
export const APP_PRIMARY_CATEGORY = "Video Editor";
export const APP_TAGS = ["video", "ai", "editing", "nft", "farcaster"];
export const APP_ICON_URL = `${APP_URL}/icon.png`;
export const APP_OG_IMAGE_URL = `${APP_URL}/api/opengraph-image`;
export const APP_SPLASH_URL = `${APP_URL}/splash.png`;
export const APP_SPLASH_BACKGROUND_COLOR = "#0b0f14";
export const APP_BUTTON_TEXT = "Launch VibeForge";
export const APP_WEBHOOK_URL =
  process.env.NEYNAR_API_KEY && process.env.NEYNAR_CLIENT_ID
    ? `https://api.neynar.com/f/app/${process.env.NEYNAR_CLIENT_ID}/event`
    : `${APP_URL}/api/webhook`;
export const USE_WALLET = process.env.NEXT_PUBLIC_USE_WALLET === "true";

// AI Configuration
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
export const HUGGING_FACE_API_KEY =
  process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY;

// IPFS Configuration
export const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN;

// Base Network Configuration
export const BASE_CHAIN_ID = 8453;
export const BASE_RPC_URL = "https://mainnet.base.org";

// Video Editor Configuration
export const MAX_VIDEO_DURATION = 300; // 5 minutes
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const SUPPORTED_VIDEO_FORMATS = ["mp4", "webm", "mov", "avi"];
export const SUPPORTED_AUDIO_FORMATS = ["mp3", "wav", "ogg", "aac"];
export const SUPPORTED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
