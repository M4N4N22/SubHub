"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  currency: "MATIC" | "USDC";
  balance: number;
  withdraw: () => Promise<`0x${string}`>;
  loading: boolean;
  error: string | null;
}

export function WithdrawModal({
  open,
  onClose,
  currency,
  balance,
  withdraw,
  loading,
  error,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");

  async function handleSubmit() {
    const num = Number(amount);

    if (isNaN(num) || num <= 0) {
      return toast.error("Enter a valid amount");
    }

    if (num > balance) {
      return toast.error("Amount exceeds available balance");
    }

    try {
      await withdraw();
      toast.success(`${currency} withdrawal submitted`);
      setAmount("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Withdrawal failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw {currency}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Balance */}
          <div>
            <label className="text-sm font-medium">Available Balance</label>
            <div className="mt-1 p-2 border rounded-md bg-muted/30 text-sm">
              {balance} {currency}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              placeholder={`Enter ${currency} amount`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 p-2 rounded">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing..." : "Withdraw"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
