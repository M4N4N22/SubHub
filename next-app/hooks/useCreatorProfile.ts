"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

import CreatorProfileArtifact from "@/abi/CreatorProfile.json";
import { CREATOR_PROFILE_ADDRESS } from "@/constants/contracts";
import { useEvmWallet } from "@/hooks/useEvmWallet";

const ABI = CreatorProfileArtifact.abi;

// --------------------------------------
// Utility: Fetch metadata from IPFS
// --------------------------------------
async function fetchIPFSMetadata(cid: string) {
  console.log("fetchIPFSMetadata called with cid:", cid);

  if (!cid) {
    console.log("CID is empty");
    return null;
  }

  const clean = cid.replace("ipfs://", "");
  const url = `https://gateway.pinata.cloud/ipfs/${clean}`;

  console.log("Fetching IPFS URL:", url);

  const res = await fetch(url);
  console.log("IPFS response status:", res.status);

  if (!res.ok) {
    console.log("IPFS fetch failed");
    return null;
  }

  const data = await res.json();
  console.log("Fetched IPFS metadata:", data);
  return data;
}

// --------------------------------------
// Main Hook
// --------------------------------------
export function useCreatorProfile(targetAddress?: string) {
  const { provider, address: walletAddress, connected } = useEvmWallet();

  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  const addressToLoad = targetAddress || walletAddress;

  console.log("useCreatorProfile state:", {
    connected,
    providerExists: !!provider,
    walletAddress,
    targetAddress,
    addressToLoad,
  });

  // -----------------------------
  // Load Profile from On-Chain
  // -----------------------------
  const loadProfile = useCallback(async () => {
    console.log("loadProfile() triggered");

    if (!provider) {
      console.log("Provider missing");
      return;
    }
    if (!connected) {
      console.log("Wallet not connected");
      return;
    }
    if (!addressToLoad) {
      console.log("No address available to load profile for");
      return;
    }

    try {
      setLoading(true);
      console.log("Loading profile for:", addressToLoad);

      const contract = new ethers.Contract(
        CREATOR_PROFILE_ADDRESS,
        ABI,
        provider
      );

      console.log("Contract instantiated at:", CREATOR_PROFILE_ADDRESS);

      const profileCid: string = await contract.getCreatorProfile(addressToLoad);
      console.log("getCreatorProfile returned CID:", profileCid);

      if (!profileCid || profileCid.trim() === "") {
        console.log("No CID stored on-chain for address:", addressToLoad);
        setCid(null);
        setMetadata(null);
        return;
      }

      setCid(profileCid);

      console.log("Fetching IPFS metadata for CID:", profileCid);
      const meta = await fetchIPFSMetadata(profileCid);

      if (!meta) {
        console.log("No metadata found on IPFS");
      } else {
        console.log("Metadata loaded:", meta);
      }

      setMetadata(meta);
    } catch (err) {
      console.log("Error loading profile:", err);
    } finally {
      console.log("loadProfile() finished");
      setLoading(false);
    }
  }, [provider, connected, addressToLoad]);

  // -----------------------------
  // Write: Update CID on-chain
  // -----------------------------
  const updateProfile = useCallback(
    async (newCid: string) => {
      console.log("updateProfile called with CID:", newCid);

      if (!provider || !connected) {
        console.log("Cannot update profile: provider or connection missing");
        throw new Error("Wallet not connected");
      }

      const signer = await provider.getSigner();
      console.log("Signer address:", await signer.getAddress());

      const contract = new ethers.Contract(
        CREATOR_PROFILE_ADDRESS,
        ABI,
        signer
      );

      console.log("Executing setCreatorProfile...");
      const tx = await contract.setCreatorProfile(newCid);
      console.log("Transaction sent:", tx.hash);

      await tx.wait();
      console.log("Transaction confirmed");

      await loadProfile();
      return true;
    },
    [provider, connected, loadProfile]
  );

  // -----------------------------
  // Auto-load when wallet changes
  // -----------------------------
  useEffect(() => {
    console.log("useEffect triggered: dependencies changed", {
      connected,
      addressToLoad,
    });

    if (connected && addressToLoad) {
      console.log("Auto-loading profile");
      loadProfile();
    } else {
      console.log("Skipping auto-load, missing connection or address");
    }
  }, [connected, addressToLoad, loadProfile]);

  return {
    cid,
    metadata,
    loading,
    updateProfile,
    reload: loadProfile,
    exists: !!metadata,
  };
}
