"use client";

import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import ContentGatingABI from "@/abi/ContentGating.json";
import { CONTENT_GATING_ADDRESS } from "@/constants/contracts";

// ---------------------------
// Strong Type for Arguments
// ---------------------------
export type UploadArgs = {
  file: File;
  title: string;
  description: string;
  gate: number;     // GateType enum numeric value
  planId: string;   // string form so BigInt works
  tierId: string;
};

export function useUploadContent() {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [loading, setLoading] = useState(false);

  // ---------------------------
  // Upload media file to Pinata
  // ---------------------------
  async function uploadMedia(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload-file-to-pinata", {
      method: "POST",
      body: fd,
    });

    const out = await res.json();
    if (!res.ok || !out.cid) {
      throw new Error("File upload failed");
    }

    return out.cid as string;
  }

  // ---------------------------
  // Upload metadata JSON to Pinata
  // ---------------------------
  async function uploadMetadata(meta: object): Promise<string> {
    const res = await fetch("/api/upload-json-to-pinata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: meta }),
    });

    const out = await res.json();
    if (!res.ok || !out.cid) {
      throw new Error("Metadata upload failed");
    }

    return out.cid as string;
  }

  // ---------------------------
  // Contract call: postContent()
  // ---------------------------
  async function postContent(
    gate: number,
    planId: string,
    tierId: string,
    cid: string
  ): Promise<void> {
    await writeContractAsync({
      address: CONTENT_GATING_ADDRESS as `0x${string}`,
      abi: ContentGatingABI.abi,
      functionName: "postContent",
      args: [
        gate,                           // GateType
        BigInt(planId || "0"),          // planId
        BigInt(tierId || "0"),          // tierId
        cid,                            // contentCID
      ],
    });
  }

  // ---------------------------
  // Main handler
  // ---------------------------
  async function handleUpload({
    file,
    title,
    description,
    gate,
    planId,
    tierId,
  }: UploadArgs): Promise<{ metaCid: string }> {

    if (!isConnected) {
      throw new Error("Wallet not connected");
    }

    setLoading(true);
    try {
      // 1. Upload media
      const mediaCid = await uploadMedia(file);

      // 2. Upload metadata JSON
      const metadata = {
        title,
        description,
        media: `ipfs://${mediaCid}`,
        gate,
        planId,
        tierId,
        createdAt: new Date().toISOString(),
      };

      const metaCid = await uploadMetadata(metadata);

      // 3. SC write
      await postContent(gate, planId, tierId, metaCid);

      return { metaCid };
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    handleUpload,
  };
}
