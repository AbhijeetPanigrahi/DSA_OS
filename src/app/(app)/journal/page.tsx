import { PageHeader } from "@/components/layout/PageHeader";
import { Surface } from "@/components/ui/Surface";

export default function JournalPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pattern Journal" 
        subtitle="Your reusable lessons and problem observations" 
      />
      <Surface variant="default">
        <p className="text-sm text-dsa-muted">Pattern Journal container initialized.</p>
      </Surface>
    </div>
  );
}
