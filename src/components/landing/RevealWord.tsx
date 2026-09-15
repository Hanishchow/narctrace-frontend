import { motion, type MotionValue, useTransform } from "framer-motion";

interface RevealWordProps {
  word: string;
  range: [number, number];
  scrollYProgress: MotionValue<number>;
}

// One word of a scroll-driven reveal sentence. Extracted so useTransform is
// called at a stable hook position per word, not inside a .map() callback.
export function RevealWord({ word, range, scrollYProgress }: RevealWordProps) {
  const opacity = useTransform(scrollYProgress, range, [0.2, 1]);
  const color = useTransform(scrollYProgress, range, ["hsl(0 0% 35%)", "hsl(0 0% 100%)"]);
  return (
    <motion.span style={{ opacity, color }} className="mr-[0.3em]">
      {word}
    </motion.span>
  );
}
