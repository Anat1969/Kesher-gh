import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

/** Counts smoothly from the previous value to the new one. */
export default function AnimatedNumber({ value, duration = 0.6, className = '' }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const controls = animate(from.current, value, {
      duration,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: v => setShown(Math.round(v)),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return <span className={className} dir="ltr">{shown}</span>;
}
