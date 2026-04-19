import { Card } from "@/components/ui/card";

export default function AdminReviewQueue() {
  return (
    <Card className="p-6">
      <h1 className="text-xl font-semibold">Review queue</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Pribudne v Phase E — split-panel review s klávesovými skratkami (A/E/F/N).
      </p>
    </Card>
  );
}
