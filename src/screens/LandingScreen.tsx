import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { DashboardPreview } from "../components/landing/DashboardPreview";
import { RevealWord } from "../components/landing/RevealWord";
import { HowItWorks } from "../components/landing/HowItWorks";
import { LandingFooter } from "../components/landing/LandingFooter";

interface LandingScreenProps {
  onGetStarted: () => void;
}

const MISSION =
  "We built NarcTrace because a field officer's call should never rest on memory or " +
  "subjectivity. Every reaction deserves a record that is precise, reproducible, " +
  "and defensible the moment it is captured.";

function MissionReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"],
  });

  const words = MISSION.split(" ");

  return (
    <div ref={containerRef} className="mx-auto flex max-w-3xl flex-col items-start gap-10">
      <svg viewBox="0 0 56 40" fill="none" aria-hidden="true" className="h-10 w-14 object-contain opacity-60">
        <path
          d="M0 40V22.9C0 9.9 8.3 1.3 22 0v8.6c-6.9 1.3-10.8 5.7-10.8 11.4h10.8V40H0Zm34 0V22.9C34 9.9 42.3 1.3 56 0v8.6c-6.9 1.3-10.8 5.7-10.8 11.4H56V40H34Z"
          fill="currentColor"
          className="text-muted-foreground"
        />
      </svg>

      <p className="flex flex-wrap text-4xl font-medium leading-[1.2] md:text-5xl">
        {words.map((word, i) => (
          <RevealWord
            key={i}
            word={word}
            range={[i / words.length, (i + 1) / words.length]}
            scrollYProgress={scrollYProgress}
          />
        ))}
        <span className="ml-2 text-muted-foreground">”</span>
      </p>

      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-foreground bg-muted">
          <ShieldCheck className="h-6 w-6 text-foreground" strokeWidth={2.25} />
        </span>
        <div>
          <p className="text-base font-semibold leading-7 text-foreground">Team Celure</p>
          <p className="text-sm font-normal leading-5 text-muted-foreground">
            Smart India Hackathon — SIH26231
          </p>
        </div>
      </div>
    </div>
  );
}

// Stat strip shown below the hero
const STATS = [
  { value: "< 30s", label: "Capture to record" },
  { value: "CIELAB", label: "Colour science engine" },
  { value: "SHA-256", label: "Image hash on every test" },
  { value: "GPS + time", label: "Sealed into every record" },
];

export function LandingScreen({ onGetStarted }: LandingScreenProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, -250]);

  return (
    <div className="bg-background text-foreground">
      <section ref={sectionRef} className="relative w-full overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
          autoPlay loop muted playsInline aria-hidden="true"
        />
        <div className="absolute inset-0 bg-background/40" aria-hidden="true" />

        <div className="relative z-10 flex min-h-screen flex-col">
          <nav className="flex items-center justify-between px-8 py-4 md:px-28">
            <div className="flex items-center gap-10 md:gap-16">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
                  <ShieldCheck className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <span className="text-xl font-bold tracking-tight">NarcTrace</span>
              </div>
              <div className="hidden items-center gap-1 md:flex">
                {["How it works", "Evidence chain", "SIH26231"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-85"
            >
              Open app
            </button>
          </nav>

          <motion.div
            style={{ y: contentY, opacity: contentOpacity }}
            className="mt-16 flex flex-col items-center px-4 text-center md:mt-20"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="liquid-glass mb-6 rounded-lg px-3 py-2"
            >
              <span className="mr-2 rounded-md bg-foreground px-2 py-0.5 text-sm font-medium text-background">
                SIH 2026
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                Problem SIH26231 · Team Celure
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-3 text-5xl font-medium leading-tight tracking-[-2px] md:text-7xl md:leading-[1.15]"
            >
              Field Evidence.
              <br />
              One Clear <span className="font-serif font-normal italic">Record</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 max-w-xl text-lg font-normal leading-7 text-hero-subtitle opacity-90"
            >
              Digitise the colorimetric drug-test reaction into a tamper-evident evidence record —
              GPS-tagged, hashed, and court-ready in under 30 seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <motion.button
                type="button"
                onClick={onGetStarted}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-full bg-foreground px-8 py-3.5 text-base font-medium text-background"
              >
                Start capturing
              </motion.button>
              <motion.button
                type="button"
                onClick={onGetStarted}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-full border border-foreground/30 bg-background/20 px-8 py-3.5 text-base font-medium text-foreground backdrop-blur-sm"
              >
                View demo
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ y: dashboardY }}
            className="relative z-10 mx-auto mt-16 w-[92%] max-w-5xl overflow-hidden rounded-2xl border border-border shadow-2xl md:mt-20"
          >
            <div className="md:aspect-[16/9]">
              <DashboardPreview />
            </div>
          </motion.div>

          <div className="h-24 shrink-0 md:h-32" />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-background to-transparent"
          aria-hidden="true"
        />
      </section>

      {/* Stats strip */}
      <section className="border-y border-border px-8 py-10 md:px-28">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="text-2xl font-bold tracking-tight">{s.value}</span>
              <span className="text-sm text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="min-h-screen px-8 py-24 md:px-28 md:py-32">
        <MissionReveal />
      </section>

      <HowItWorks />

      <LandingFooter onGetStarted={onGetStarted} />
    </div>
  );
}
