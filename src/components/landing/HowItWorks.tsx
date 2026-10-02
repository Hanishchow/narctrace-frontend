import { motion } from "framer-motion";
import { Camera, FileCheck2, MapPin, ScanLine } from "lucide-react";

const STEPS = [
  {
    icon: MapPin,
    title: "Select kit & location",
    description: "Choose your colorimetric test kit and optionally pin GPS coordinates. Takes under 10 seconds.",
  },
  {
    icon: Camera,
    title: "Guided camera capture",
    description: "Frame the reaction well inside the overlay. The app checks focus, exposure and glare before accepting.",
  },
  {
    icon: ScanLine,
    title: "CIELAB colour analysis",
    description: "ΔE thresholds against reference card values classify the reaction — no black-box ML, fully auditable.",
  },
  {
    icon: FileCheck2,
    title: "Tamper-evident record",
    description: "SHA-256 image hash, GPS, timestamp and operator ID are sealed into an evidence passport on submission.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-8 py-24 md:px-28 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">How it works</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
            Reaction to <span className="font-serif font-normal italic">record</span> in four steps.
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            No training required. The same workflow every time, for every officer, on any device.
          </p>
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
