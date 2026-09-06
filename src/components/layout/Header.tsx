import { Flame } from "lucide-react";

interface HeaderProps {
  displayName?: string;
  streakDays?: number;
}

export function Header({ displayName = "Learner", streakDays = 0 }: HeaderProps) {
  return (
    <header className="h-16 bg-white/60 backdrop-blur-md border-b border-dsa-border/60 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-sm font-semibold text-dsa-text">
          Welcome back, <span className="text-brand font-bold">{displayName}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 font-bold text-xs shadow-sm">
          <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
          <span>{streakDays} DAY STREAK</span>
        </div>
      </div>
    </header>
  );
}
