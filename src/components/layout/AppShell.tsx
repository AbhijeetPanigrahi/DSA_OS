"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header displayName="Learner" streakDays={0} />
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Settings Modal Placeholder */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-dsa-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-dsa-border">
              <h2 className="text-lg font-bold text-dsa-text">Settings</h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-dsa-muted hover:text-dsa-text text-sm font-semibold"
              >
                Close ✕
              </button>
            </div>
            <div className="py-6 space-y-4">
              <p className="text-sm text-dsa-muted">
                System & Practice Preferences (Settings Modal Architecture ready).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
