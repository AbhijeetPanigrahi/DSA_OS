import { PageHeader } from "@/components/layout/PageHeader";
import { Surface } from "@/components/ui/Surface";

export default function RevisionPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Revision" 
        subtitle="Active recall spaced repetition engine" 
      />
      <Surface variant="default">
        <p className="text-sm text-dsa-muted">Revision queue container initialized.</p>
      </Surface>
    </div>
  );
}
