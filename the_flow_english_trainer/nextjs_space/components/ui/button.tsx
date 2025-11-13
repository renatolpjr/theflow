import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-[#1e3a5f] text-white hover:bg-[#2c5085] hover:shadow-md hover:-translate-y-0.5",
        destructive:
          "bg-[#DC2626] text-white hover:bg-[#b91c1c] hover:shadow-md",
        outline:
          "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-[#DC2626] hover:border-[#DC2626]",
        secondary:
          "bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:shadow-md hover:-translate-y-0.5",
        ghost: "shadow-none text-slate-700 hover:bg-slate-100 hover:text-[#DC2626]",
        link: "text-[#1e3a5f] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }