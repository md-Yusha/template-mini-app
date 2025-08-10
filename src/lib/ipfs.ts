import { Web3Storage } from "web3.storage";
import { WEB3_STORAGE_TOKEN } from "./constants";

export interface IPFSUploadResult {
  success: boolean;
  cid?: string;
  url?: string;
  error?: string;
}

export interface VideoMetadata {
  title: string;
  description: string;
  creator: string;
  creatorFid: number;
  duration: number;
  resolution: { width: number; height: number };
  fps: number;
  tags: string[];
  createdAt: number;
  thumbnail?: string;
}

// Initialize Web3.storage client
const getWeb3Storage = () => {
  if (!WEB3_STORAGE_TOKEN) {
    throw new Error("Web3.storage token not configured");
  }
  return new Web3Storage({ token: WEB3_STORAGE_TOKEN });
};

// Upload file to IPFS via Web3.storage
export async function uploadToIPFS(
  file: File | Blob,
  filename?: string
): Promise<IPFSUploadResult> {
  try {
    const client = getWeb3Storage();

    // Create a File object if it's a Blob
    const fileToUpload =
      file instanceof File ? file : new File([file], filename || "file");

    const cid = await client.put([fileToUpload]);
    const url = `https://${cid}.ipfs.dweb.link/${filename || "file"}`;

    return { success: true, cid, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Upload video with metadata
export async function uploadVideoWithMetadata(
  videoBlob: Blob,
  metadata: VideoMetadata
): Promise<IPFSUploadResult> {
  try {
    const client = getWeb3Storage();

    // Create video file
    const videoFile = new File([videoBlob], "video.mp4", { type: "video/mp4" });

    // Create metadata file
    const enrichedMetadata = {
      ...metadata,
      videoCid: "", // Will be updated after video upload
    };

    const metadataBlob = new Blob([JSON.stringify(enrichedMetadata, null, 2)], {
      type: "application/json",
    });
    const metadataFile = new File([metadataBlob], "metadata.json", {
      type: "application/json",
    });

    // Upload both files together
    const cid = await client.put([videoFile, metadataFile]);

    // Update metadata with video CID
    enrichedMetadata.videoCid = cid;
    const updatedMetadataBlob = new Blob(
      [JSON.stringify(enrichedMetadata, null, 2)],
      {
        type: "application/json",
      }
    );
    const updatedMetadataFile = new File(
      [updatedMetadataBlob],
      "metadata.json",
      { type: "application/json" }
    );

    // Upload updated metadata
    const finalCid = await client.put([videoFile, updatedMetadataFile]);

    return {
      success: true,
      cid: finalCid,
      url: `https://${finalCid}.ipfs.dweb.link/metadata.json`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Upload thumbnail image
export async function uploadThumbnail(
  imageBlob: Blob
): Promise<IPFSUploadResult> {
  return await uploadToIPFS(imageBlob, "thumbnail.png");
}

// Get file from IPFS
export async function getFromIPFS(
  cid: string,
  filename?: string
): Promise<Blob | null> {
  try {
    const url = `https://${cid}.ipfs.dweb.link/${filename || ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    return await response.blob();
  } catch (error) {
    console.error("Failed to get file from IPFS:", error);
    return null;
  }
}

// Get metadata from IPFS
export async function getMetadataFromIPFS(
  cid: string
): Promise<VideoMetadata | null> {
  try {
    const metadataBlob = await getFromIPFS(cid, "metadata.json");
    if (!metadataBlob) {
      return null;
    }

    const metadataText = await metadataBlob.text();
    return JSON.parse(metadataText) as VideoMetadata;
  } catch (error) {
    console.error("Failed to get metadata from IPFS:", error);
    return null;
  }
}

// Generate IPFS gateway URL
export function getIPFSGatewayURL(cid: string, filename?: string): string {
  return `https://${cid}.ipfs.dweb.link/${filename || ""}`;
}

// Alternative IPFS gateways for redundancy
export const IPFS_GATEWAYS = [
  "https://dweb.link",
  "https://ipfs.io",
  "https://gateway.pinata.cloud",
  "https://cloudflare-ipfs.com",
];

export function getAlternativeIPFSURL(
  cid: string,
  filename?: string,
  gatewayIndex = 0
): string {
  const gateway = IPFS_GATEWAYS[gatewayIndex % IPFS_GATEWAYS.length];
  return `${gateway}/ipfs/${cid}/${filename || ""}`;
}
