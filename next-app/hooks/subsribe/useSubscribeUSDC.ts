"use client";

import { useState } from "react";
import {
    createPublicClient,
    createWalletClient,
    custom,
    http,
    parseSignature,
} from "viem";
import { polygonAmoy } from "viem/chains";
import { useAccount, useWriteContract } from "wagmi";

import PaymentManagerABI from "@/abi/PaymentManager.json";
import {
    PAYMENT_MANAGER_ADDRESS,
    USDC_ADDRESS,
} from "@/constants/contracts";

const PERMIT2_ADDRESS =
    "0x000000000022D473030F116dDEE9F6B43aC78BA3";



const client = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
});

type TxState =
  | "idle"
  | "signing"
  | "subscribing"
  | "confirmed"
  | "error";

export function useSubscribeUSDC(planId: bigint) {
    const { address } = useAccount();
    const { writeContractAsync } = useWriteContract();

    const [txState, setTxState] = useState<TxState>("idle");
    const [expiry, setExpiry] = useState<number | null>(null);
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [error, setError] = useState("");

    const PERMIT2_ABI = [
        {
            name: "allowance",
            type: "function",
            stateMutability: "view",
            inputs: [
                { name: "owner", type: "address" },
                { name: "token", type: "address" },
                { name: "spender", type: "address" },
            ],
            outputs: [
                { name: "amount", type: "uint160" },
                { name: "expiration", type: "uint48" },
                { name: "nonce", type: "uint48" },
            ],
        },
    ] as const;

    async function subscribeWithPermit2() {
        if (!address || !window.ethereum) return;

        try {
            setError("");
            setTxState("signing");

            // ----------------------------------
            // 1️⃣ Read plan condition
            // ----------------------------------
            const condition = await client.readContract({
                address: PAYMENT_MANAGER_ADDRESS,
                abi: PaymentManagerABI.abi,
                functionName: "getPaymentCondition",
                args: [planId],
            }) as readonly [`0x${string}`, bigint, bigint];

            const amount = condition[1];

            if (amount === BigInt(0)) throw new Error("Invalid plan price");


            // ----------------------------------
            // 2️⃣ Fetch Permit2 Nonce
            // ----------------------------------

            const allowanceData = await client.readContract({
                address: PERMIT2_ADDRESS,
                abi: PERMIT2_ABI,
                functionName: "allowance",
                args: [address, USDC_ADDRESS, PAYMENT_MANAGER_ADDRESS],
            }) as readonly [bigint, number, number];

            const amountAllowed = allowanceData[0];
            const expiration = allowanceData[1];
            const nonceNumber = allowanceData[2];

            // Convert nonce to bigint for typed data
            const nonce = BigInt(nonceNumber);
            const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 10);

            // ----------------------------------
            // 3️⃣ Build Permit2 Signature
            // ----------------------------------

            const walletClient = createWalletClient({
                chain: polygonAmoy,
                transport: custom(window.ethereum),
            });

            const signature = await walletClient.signTypedData({
                account: address,
                domain: {
                    name: "Permit2",
                    chainId: polygonAmoy.id,
                    verifyingContract: PERMIT2_ADDRESS,
                },
                types: {
                    TokenPermissions: [
                        { name: "token", type: "address" },
                        { name: "amount", type: "uint256" },
                    ],
                    PermitTransferFrom: [
                        { name: "permitted", type: "TokenPermissions" },
                        { name: "nonce", type: "uint256" },
                        { name: "deadline", type: "uint256" },
                    ],
                },
                primaryType: "PermitTransferFrom",
                message: {
                    permitted: {
                        token: USDC_ADDRESS,
                        amount: amount,
                    },
                    nonce: nonce,
                    deadline: deadline,
                },
            });

            const { v, r, s } = parseSignature(signature);

            // ----------------------------------
            // 3️⃣ Call subscribeWithPermit2
            // ----------------------------------
            setTxState("subscribing");

            const txHash = await writeContractAsync({
                address: PAYMENT_MANAGER_ADDRESS,
                abi: PaymentManagerABI.abi,
                functionName: "subscribeWithPermit2",
                args: [
                    planId,
                    {
                        permitted: {
                            token: USDC_ADDRESS,
                            amount: amount,
                        },
                        nonce: nonce,
                        deadline: deadline,
                    },
                    {
                        to: PAYMENT_MANAGER_ADDRESS,
                        requestedAmount: amount,
                    },
                    signature,
                ],
            });

            await client.waitForTransactionReceipt({ hash: txHash });

            // ----------------------------------
            // 4️⃣ Read expiry + access
            // ----------------------------------
            const expiryRaw = await client.readContract({
                address: PAYMENT_MANAGER_ADDRESS,
                abi: PaymentManagerABI.abi,
                functionName: "subscriptionExpiry",
                args: [address, planId],
            });

            const accessRaw = await client.readContract({
                address: PAYMENT_MANAGER_ADDRESS,
                abi: PaymentManagerABI.abi,
                functionName: "hasActiveAccess",
                args: [address, planId],
            });

            setExpiry(Number(expiryRaw));
            setHasAccess(Boolean(accessRaw));
            setTxState("confirmed");

        } catch (err: any) {
            console.error("❌ Permit2 subscribe error:", err);
            setError("Subscription failed");
            setTxState("error");
        }
    }

    return {
        subscribeWithPermit2,
        txState,
        expiry,
        hasAccess,
        error,
    };
}