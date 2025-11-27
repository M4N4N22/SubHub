"use client";

import { useParams } from "next/navigation";
import { HoldersView } from "./HoldersView";
import { useTierHolders } from "@/hooks/membership/useTierHolders";

export default function HoldersPage() {
  const { id } = useParams();

  // Convert param to number
  const tierId = Number(id);

  const { loading, holders } = useTierHolders(tierId);

  return <HoldersView loading={loading} holders={holders} />;
}
