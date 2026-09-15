import { createContext, useContext, type ReactNode } from "react";

// True only when the officer entered via the "Continue in demo mode" bypass
// on the login screen (backend was unreachable). Screens read this to swap
// their real src/api/client calls for src/lib/mock fixtures — the real API
// module itself is never modified.
const DemoModeContext = createContext(false);

export function DemoModeProvider({ demo, children }: { demo: boolean; children: ReactNode }) {
  return <DemoModeContext.Provider value={demo}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
