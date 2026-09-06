import { PageHeader } from "@/components/layout/PageHeader";
import { Surface } from "@/components/ui/Surface";

export default function PatternsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Patterns" 
        subtitle="Canonical Data Structures & Algorithms patterns" 
      />
      <Surface variant="default">
        <p className="text-sm text-dsa-muted">Patterns catalog container initialized.</p>
      </Surface>
    </div>
  );
}
