import { CreatorPlansList } from "@/components/creator/CreatorPlansList";

export default function CreatorDashboard() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold mb-6">Your Subscription Plans</h1>

      <CreatorPlansList />
    </div>
  );
}
