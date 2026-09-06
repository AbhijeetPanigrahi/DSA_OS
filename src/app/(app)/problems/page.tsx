import { PageHeader } from "@/components/layout/PageHeader";
import { Surface } from "@/components/ui/Surface";

export default function ProblemsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Problems" 
        subtitle="Search and practice problems from the complete library" 
      />
      <Surface variant="default">
        <p className="text-sm text-dsa-muted">Problem library container initialized.</p>
      </Surface>
    </div>
  );
}
