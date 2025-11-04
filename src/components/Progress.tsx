"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface CustomProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string; // Prop for indicator styling
  showText?: boolean; // New prop to show text inside the progress bar
  text?: string; // New prop for the text to display
  isCooldown?: boolean; // New prop to indicate if it's on cooldown
  isReady?: boolean; // NEW: Prop to indicate if it's ready
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  CustomProgressProps
>(({ className, value, indicatorClassName, showText, text, isCooldown, isReady, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-300 ease-out", // Added duration for smoother transition
        indicatorClassName || "bg-primary",
        isCooldown && "opacity-50 animate-pulse-cooldown", // Apply opacity and pulse when on cooldown
        isReady && "animate-pulse-ready" // Apply pulse when ready
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
    {showText && text && (
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white z-10 drop-shadow-sm"> {/* Made text bolder and added shadow */}
        {text}
      </span>
    )}
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }