import { Camera, History as HistoryIcon, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import type { Officer } from "../api/types";

interface SidebarProps {
  officer: Officer;
  screen: "start" | "capture" | "result" | "history";
  demo: boolean;
  onNavStart: () => void;
  onNavHistory: () => void;
  onLogout: () => void;
}

export function Sidebar({ officer, screen, demo, onNavStart, onNavHistory, onLogout }: SidebarProps) {
  const navItemClass = (active: boolean) =>
    cn(
      "flex min-h-[var(--tap-min)] items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors",
      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
    );

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border px-4 py-6 lg:flex">
      <div className="flex items-center gap-2 px-1">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent-strong text-accent-strong-foreground">
          <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" strokeWidth={2.25} />
        </span>
        <span className="text-base font-bold tracking-tight">NarcTrace</span>
      </div>

      {demo && (
        <div className="mt-4 rounded-md bg-accent-strong/10 px-3 py-2 text-xs font-medium text-accent-strong">
          Demo mode — simulated data
        </div>
      )}

      <nav className="mt-8 flex flex-col gap-1">
        <button type="button" onClick={onNavStart} className={navItemClass(screen === "start" || screen === "capture" || screen === "result")}>
          <Camera className="h-4 w-4 shrink-0" aria-hidden="true" />
          New test
        </button>
        <button type="button" onClick={onNavHistory} className={navItemClass(screen === "history")}>
          <HistoryIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          History
        </button>
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{officer.name}</p>
            <p className="mono truncate text-xs text-muted-foreground">{officer.badge_id}</p>
          </div>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-[var(--tap-min)] items-center gap-2.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
