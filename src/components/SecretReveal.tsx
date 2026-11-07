import { motion } from 'framer-motion';
import { levelColor } from '../game/gameItems';

/** Strong ease-out (Emil Kowalski): the reveal starts at once and settles. */
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * "רגע הסוד": the one orchestrated moment in the game.
 * A hand-crafted secret found for the first time is rare (once per secret, ever), so it alone earns
 * a choreographed reveal: a gold wash passes over the reading, the seal settles into place and a
 * gold hairline draws under it, right to left. Everything ends within 400ms and uses only
 * transform and opacity. With reduced motion, MotionConfig (App.tsx) keeps the fades and drops the movement.
 */
/** 1. The wash: one pass of gold light over the reading panel (0 to 400ms). Place inside a positioned panel that isolates (z-index -10 keeps it under the text). */
export function SecretWash() {
  return (
    <motion.span
      aria-hidden="true"
      data-secret-wash
      className="pointer-events-none absolute inset-0 -z-10"
      style={{ background: levelColor('s', 0.12) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.4, times: [0, 0.3, 1], ease: 'easeOut' }}
    />
  );
}

export default function SecretReveal({ compact = false }: { compact?: boolean }) {
  const gold = levelColor('s');
  return (
    <div className={`relative ${compact ? '' : 'mb-4'}`} role="status">
      {/* 2. The seal settles (0 to 320ms). */}
      <motion.span
        className="label-mono relative inline-block px-1.5 py-px"
        style={{ color: gold, background: levelColor('s', 0.1) }}
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: EASE_OUT }}
      >
        סוד חדש נחשף
      </motion.span>
      {/* 3. The hairline draws from the right, as Hebrew is read (40 to 400ms). */}
      {!compact && (
        <motion.span
          aria-hidden="true"
          className="mt-2 block h-px origin-right"
          style={{ background: gold }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.04, duration: 0.36, ease: EASE_OUT }}
        />
      )}
    </div>
  );
}
