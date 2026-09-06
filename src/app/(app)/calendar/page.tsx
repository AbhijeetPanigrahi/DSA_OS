import { PageHeader } from "@/components/layout/PageHeader";
import { Surface } from "@/components/ui/Surface";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Calendar" 
        subtitle="Visual practice history and activity breakdown" 
      />
      <Surface variant="default">
        <p className="text-sm text-dsa-muted">Calendar grid container initialized.</p>
      </Surface>
    </div>
  );
}
