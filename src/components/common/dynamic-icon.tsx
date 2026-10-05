import {
  BatteryCharging,
  Headset,
  Package,
  RotateCcw,
  ShieldCheck,
  Sun,
  Truck,
  type LucideIcon,
} from "lucide-react"

/** Maps icon names stored in the CMS to lucide components (keeps the bundle tree-shaken). */
const icons: Record<string, LucideIcon> = {
  "battery-charging": BatteryCharging,
  headset: Headset,
  "rotate-ccw": RotateCcw,
  "shield-check": ShieldCheck,
  sun: Sun,
  truck: Truck,
}

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Package
  return <Icon className={className} aria-hidden />
}
