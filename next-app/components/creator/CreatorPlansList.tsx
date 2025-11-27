"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCreatorPlans } from "@/hooks/useCreatorPlans";

export function CreatorPlansList() {
  const { plans, loading, toggleActive } = useCreatorPlans();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        Loading your subscription plans...
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground mb-3">
            You haven't created any plans yet.
          </p>
          <Link href="/creator/plans/create">
            <a>Create Your First Plan</a>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {plans.map((plan) => (
        <Card key={plan.planId}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{plan.metadata?.name || `Plan #${plan.planId}`}</span>

              <Switch
                checked={plan.active}
                onCheckedChange={() => toggleActive(plan.planId, plan.active)}
              />
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {plan.metadata?.description}
            </p>

            <p>
              <span className="font-semibold">Price: </span>
              {Number(plan.price) / 1e18} MATIC
            </p>

            <p>
              <span className="font-semibold">Frequency: </span>
              {plan.frequency === 86400 && "Daily"}
              {plan.frequency === 604800 && "Weekly"}
              {plan.frequency === 2592000 && "Monthly"}
            </p>

            {plan.metadata?.createdAt && (
              <p className="text-muted-foreground text-xs">
                Created{" "}
                {formatDistanceToNow(new Date(plan.metadata.createdAt), {
                  addSuffix: true,
                })}
              </p>
            )}

            <Button variant="outline" className="w-full" asChild>
              <a
                href={`${window.location.origin}/subscribe?plan=${plan.planId}`}
                target="_blank"
              >
                View Public Page
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
