import { ShieldCheck } from "lucide-react";
import { Button } from "../Button";

interface LandingFooterProps {
  onGetStarted: () => void;
}

export function LandingFooter({ onGetStarted }: LandingFooterProps) {
  return (
    <footer className="border-t border-border px-8 py-16 md:px-28">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border pb-12 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">
              Ready to record your first <span className="font-serif font-normal italic">test</span>?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with a badge ID, or explore the full flow in demo mode.
            </p>
          </div>
          <Button onClick={onGetStarted} className="rounded-full px-8 py-3.5">
            Get Started
          </Button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight">NarcTrace</span>
          </div>

          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            PRESUMPTIVE FIELD-TEST RESULT ONLY. This software does not replace laboratory
            confirmatory testing. All kit profiles, thresholds and target colour values are
            SIMULATED / PROXY values for safe demonstration.
          </p>

          <p className="text-xs text-muted-foreground">
            Smart India Hackathon — SIH26231
            <br />© {new Date().getFullYear()} NarcTrace
          </p>
        </div>
      </div>
    </footer>
  );
}
