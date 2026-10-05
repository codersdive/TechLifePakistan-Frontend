"use client"

import { motion, type HTMLMotionProps, type Variants } from "motion/react"

const EASE = [0.22, 1, 0.36, 1] as const

type Dir = "up" | "down" | "left" | "right" | "none"
const offset = (d: Dir, n = 28) =>
  ({ up: { y: n }, down: { y: -n }, left: { x: n }, right: { x: -n }, none: {} })[d]

interface RevealProps extends HTMLMotionProps<"div"> {
  direction?: Dir
  delay?: number
  duration?: number
}

/** Fades + slides children in once they scroll into view. */
export function Reveal({ direction = "up", delay = 0, duration = 0.7, ...props }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, ...offset(direction) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration, delay, ease: EASE }}
      {...props}
    />
  )
}

const container: Variants = {
  hidden: {},
  show: (stagger: number = 0.08) => ({ transition: { staggerChildren: stagger } }),
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

/** Staggers direct <StaggerItem> children as the group enters the viewport. */
export function Stagger({ stagger = 0.08, ...props }: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      variants={container}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      {...props}
    />
  )
}

export function StaggerItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={staggerItem} {...props} />
}
