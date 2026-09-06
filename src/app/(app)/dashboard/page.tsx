import { PageHeader } from "@/components/layout/PageHeader";
import { Surface } from "@/components/ui/Surface";
import { Flame, CheckCircle2, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        subtitle="Your morning command center for DSA mastery" 
      />

      {/* Today's Mission Card */}
      <Surface variant="raised" className="border-l-4 border-l-brand">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold">
              Today's Focus: Arrays + Hashing
            </div>
            <h2 className="text-xl font-bold text-dsa-text">Today's Mission</h2>
            <p className="text-sm text-dsa-muted">
              Build stronger pattern recognition with today's scheduled problem set.
            </p>
          </div>
          <div>
            <button className="px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl font-semibold text-sm shadow-soft transition-colors flex items-center gap-2">
              Start Today's Session <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Surface>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Surface variant="default">
          <h3 className="text-xs font-semibold text-dsa-subtle uppercase tracking-wider mb-2">Next Up</h3>
          <p className="text-lg font-bold text-dsa-text">Contains Duplicate</p>
          <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold">
            Easy
          </span>
        </Surface>

        <Surface variant="default">
          <h3 className="text-xs font-semibold text-dsa-subtle uppercase tracking-wider mb-2">Revision Due</h3>
          <p className="text-lg font-bold text-dsa-text">1 Item Due Today</p>
          <p className="text-xs text-dsa-muted mt-2">Active recall memory check</p>
        </Surface>

        <Surface variant="default">
          <h3 className="text-xs font-semibold text-dsa-subtle uppercase tracking-wider mb-2">Weekly Focus</h3>
          <p className="text-lg font-bold text-dsa-text">Week 1 Curriculum</p>
          <p className="text-xs text-dsa-muted mt-2">Arrays, Pointers & Binary Search</p>
        </Surface>
      </div>
    </div>
  );
}
