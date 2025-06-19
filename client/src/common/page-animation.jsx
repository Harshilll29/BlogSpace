import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const Animation = ({
  children,
  keyValue,
  initial = { opacity: 0, x: 30 }, // Slide in from below
  animate = { opacity: 1, y: 0 },
  exit = { opacity: 0, y: -30 },    // Slide out upwards
  transition = { duration: 0.5 },
  className,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyValue}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default Animation;