import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-green-600 text-primary-foreground hover:bg-green-600/80",
        secondary:
          "border-transparent bg-blue-500 text-secondary-foreground hover:bg-blue-500/80",
        destructive:
          "border-transparent bg-yellow-500 text-destructive-foreground hover:bg-yellow-500/80",
        outline: "text-foreground",
        "in-progress": "border-transparent bg-orange-500 text-primary-foreground hover:bg-orange-500/80"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
