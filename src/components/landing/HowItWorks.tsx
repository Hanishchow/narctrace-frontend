import { motion } from "framer-motion";
import { Camera, FileCheck2, LogIn, ScanLine } from "lucide-react";

const STEPS = [
  {
    icon: LogIn,
    title: "Officer sign-in",
    description: "Authenticate with a badge ID. Every capture is tied to a verified officer identity.",
  },
  {
    icon: Camera,
    title: "Standardized capture",
    description: "Guided camera flow, GPS location, and kit profile selection — the same steps every time.",
  },
  {
    icon: ScanLine,
    title: "Deterministic analysis",
    description: "CIELAB colour science and ΔE thresholds classify the reaction. No black-box ML.",
  },
  {
    icon: FileCheck2,
    title: "Tamper-evident record",
    description: "Test ID, timestamp, GPS, and image hash — stored and searchable in history.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-8 py-24 md:px-28 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-muted-foreground">How it works</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
            From reaction to <span className="font-serif font-normal italic">record</span>, in four steps.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col gap-4 border-t border-border pt-6"
            >
              <span className="mono text-xs text-muted-foreground">0{i + 1}</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border">
                <step.icon className="h-4.5 w-4.5 text-foreground" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
