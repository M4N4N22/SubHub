"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useCreatePlan } from "@/hooks/useCreatePlan";
import { toast } from "sonner";
import { PlanPreview } from "@/components/create/PlanPreview";

export function CreatePlanForm() {
  const { createPlan, loading, shareLink } = useCreatePlan();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    frequency: "",
  });

  const isValid = form.name && form.description && form.price && form.frequency;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPlan({
        name: form.name,
        description: form.description,
        price: form.price,
        frequency: form.frequency,
      });

      toast.success("Plan successfully created!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create plan");
    }
  };

  if (shareLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎉 Plan Created</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your plan is live!</p>
          <Input readOnly value={shareLink} className="my-3" />

          <Button
            onClick={() => navigator.clipboard.writeText(shareLink)}
            className="mr-2"
          >
            Copy Link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Create Subscription Plan
        </h1>
        <p className="text-muted-foreground">
          Set up recurring crypto subscriptions for your premium content
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Subscription Plan</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* PLAN NAME */}
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input
                placeholder="Premium Access"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Exclusive content, behind-the-scenes, perks"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* PRICE */}
            <div className="space-y-2">
              <Label>Price (MATIC)</Label>
              <Input
                type="number"
                placeholder="5.00"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>

            {/* BILLING FREQUENCY */}
            <div className="space-y-2">
              <Label>Billing Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) => setForm({ ...form, frequency: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="daily">Daily (24 hours)</SelectItem>
                  <SelectItem value="weekly">Weekly (7 days)</SelectItem>
                  <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PREVIEW COMPONENT */}
            <PlanPreview
              name={form.name}
              description={form.description}
              price={form.price}
              frequency={form.frequency}
            />

            {/* SUBMIT */}
            <Button className="w-full" disabled={!isValid || loading}>
              {loading ? "Creating..." : "Create Plan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
