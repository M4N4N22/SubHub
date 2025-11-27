"use client";

import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useEvmWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const amoyChainId = "0x13882"; // Polygon Amoy Testnet

  /** ------------------------------  
   *  Connect Wallet (Manual + Auto)
   * ------------------------------ */
  const connect = async () => {
    if (!window.ethereum) {
      console.log("MetaMask not detected");
      return;
    }

    try {
      const eth = window.ethereum;

      // Request accounts
      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) return;

      const provider = new BrowserProvider(eth);
      setProvider(provider);

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      setAddress(userAddress);
      setConnected(true);

      const currentChain = await eth.request({ method: "eth_chainId" });
      setChainId(currentChain);

      // Auto-switch to Amoy
      if (currentChain !== amoyChainId) {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: amoyChainId }],
        });
        setChainId(amoyChainId);
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
    }
  };

  /** ------------------------------  
   *  Auto-connect if already authorized
   * ------------------------------ */
  useEffect(() => {
    async function autoConnect() {
      if (!window.ethereum) return;

      try {
        const eth = window.ethereum;
        const accounts: string[] = await eth.request({
          method: "eth_accounts",
        });

        if (accounts && accounts.length > 0) {
          await connect(); // silently connects
        }
      } catch (e) {
        console.log("Auto-connect failed:", e);
      }
    }

    autoConnect();
  }, []);

  /** ------------------------------  
   *  Listen for account + chain changes
   * ------------------------------ */
  useEffect(() => {
    if (!window.ethereum) return;

    const eth = window.ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null);
        setConnected(false);
        return;
      }
      setAddress(accounts[0]);
      setConnected(true);
    };

    const handleChainChanged = (chain: string) => {
      setChainId(chain);

      // Auto-switch back to Amoy
      if (chain !== amoyChainId) {
        eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: amoyChainId }],
        });
      }
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const disconnect = async () => {
    setProvider(null);
    setAddress(null);
    setConnected(false);
  };

  return {
    provider,
    address,
    chainId,
    connected,
    connect,
    disconnect,
  };
}
