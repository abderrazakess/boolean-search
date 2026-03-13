import { cn } from "@/lib/utils";
import { useMotionValue, animate, motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
  speed?: number;
  speedOnHover?: number;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = "horizontal",
  reverse = false,
  className,
  speed,
  speedOnHover,
}: InfiniteSliderProps) {
  const effectiveDuration = speed ?? duration;
  const effectiveDurationOnHover = speedOnHover ?? durationOnHover;

  const [currentDuration, setCurrentDuration] = useState(effectiveDuration);
  const [size, setSize] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const innerRef = useRef<HTMLDivElement>(null);
  const translation = useMotionValue(0);

  const measureSize = useCallback(() => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    setSize(direction === "horizontal" ? rect.width : rect.height);
  }, [direction]);

  useEffect(() => {
    measureSize();
    const observer = new ResizeObserver(measureSize);
    if (innerRef.current) observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [measureSize]);

  useEffect(() => {
    if (size === 0) return;
    let controls: ReturnType<typeof animate> | undefined;
    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration:
          currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prev) => prev + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: currentDuration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return () => controls?.stop();
  }, [key, translation, currentDuration, size, gap, isTransitioning, reverse]);

  const hoverProps = effectiveDurationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentDuration(effectiveDurationOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentDuration(effectiveDuration);
        },
      }
    : {};

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        ref={innerRef}
        className="flex w-max"
        style={{
          ...(direction === "horizontal" ? { x: translation } : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
