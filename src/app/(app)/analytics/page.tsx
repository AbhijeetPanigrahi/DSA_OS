import { PageHeader } from "@/components/layout/PageHeader";
import { Surface } from "@/components/ui/Surface";
import { ANALYTICS_UNLOCK_THRESHOLD } from "@/config/business-rules";
import { Lock } from "lucide-react";

export default function AnalyticsPage() {
  const isUnlocked = false; // Mock state before Phase 14 implementation

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Analytics" 
        subtitle="Performance metrics, focus areas, and skill trends" 
      />
      {!isUnlocked ? (
        <Surface variant="raised" className="text-center py-16 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-canvas-surface flex items-center justify-center mx-auto text-dsa-muted">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-dsa-text">Analytics Locked</h2>
          <p className="text-sm text-dsa-muted max-w-md mx-auto">
            Your analytics will appear after you solve {ANALYTICS_UNLOCK_THRESHOLD} distinct problems. Keep practicing to unlock meaningful trends.
          </p>
        </Surface>
      ) : (
        <Surface variant="default">
          <p className="text-sm text-dsa-muted">Analytics unlocked view.</p>
        </Surface>
      )}
    </div>
  );
}
