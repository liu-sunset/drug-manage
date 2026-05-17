import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border-[3px] border-pencil font-body text-base font-normal whitespace-nowrap transition-all duration-100 outline-none select-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-hard-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-white text-pencil shadow-hard hover:bg-marker hover:text-white hover:border-marker hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm",
        outline:
          "bg-white text-pencil shadow-hard hover:bg-ballpoint hover:text-white hover:border-ballpoint hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm",
        secondary:
          "bg-[#e5e0d8] text-pencil shadow-hard border-pencil hover:bg-ballpoint hover:text-white hover:border-ballpoint hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm",
        ghost:
          "border-transparent shadow-none bg-transparent text-pencil hover:bg-[#e5e0d8] hover:border-pencil hover:shadow-hard-sm active:shadow-none",
        destructive:
          "bg-marker text-white border-marker shadow-hard hover:bg-[#e63939] hover:border-[#e63939] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm",
        link: "border-transparent shadow-none bg-transparent text-ballpoint underline-offset-4 hover:underline active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-10 gap-1.5 px-4",
        xs: "h-7 gap-1 px-2.5 text-sm",
        sm: "h-8 gap-1 px-3 text-sm",
        lg: "h-12 gap-2 px-6 text-lg",
        icon: "size-10 px-0",
        "icon-xs": "size-7 px-0",
        "icon-sm": "size-8 px-0",
        "icon-lg": "size-12 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  style,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={{
        borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
        ...style,
      }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
