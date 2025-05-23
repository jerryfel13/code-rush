import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-md",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white border-2 border-cyan-400 shadow-lg hover:scale-105 hover:shadow-2xl hover:border-purple-400 focus:ring-cyan-400",
        destructive:
          "bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 text-white border-2 border-red-400 shadow-lg hover:scale-105 hover:shadow-2xl hover:border-pink-400 focus:ring-red-400",
        outline:
          "border-2 border-cyan-400 bg-[#181c24]/80 text-cyan-200 hover:bg-cyan-900/20 hover:text-cyan-100 shadow-md",
        secondary:
          "bg-gradient-to-r from-purple-700 via-cyan-700 to-blue-700 text-white border-2 border-purple-400 shadow-lg hover:scale-105 hover:shadow-2xl hover:border-cyan-400 focus:ring-purple-400",
        ghost: "bg-transparent text-cyan-300 hover:bg-cyan-900/20 hover:text-white border-2 border-transparent hover:border-cyan-400",
        link: "text-cyan-400 underline-offset-4 hover:underline hover:text-purple-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
