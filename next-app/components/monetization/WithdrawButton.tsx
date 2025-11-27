"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WithdrawModal } from "./WithdrawModal";

export function WithdrawButton({
  currency,
  balance,
  withdraw,
  loading,
  error,
}: {
  currency: "MATIC" | "USDC";
  balance: number;
  withdraw: () => Promise<`0x${string}`>;
  loading: boolean;
  error: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="mt-4 w-36" onClick={() => setOpen(true)}>
        Withdraw
      </Button>

      <WithdrawModal
        open={open}
        onClose={() => setOpen(false)}
        currency={currency}
        balance={balance}
        loading={loading}
        error={error}
        withdraw={withdraw}
      />
    </>
  );
}
