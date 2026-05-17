import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-fit w-fit shrink-0 items-center justify-center gap-1 border-[2px] px-2.5 py-0.5 font-body text-sm whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-marker text-white border-marker",
        secondary: "bg-[#e5e0d8] text-pencil border-pencil",
        destructive: "bg-red-100 text-marker border-marker",
        outline: "bg-white text-pencil border-pencil",
        ghost: "border-transparent bg-[#e5e0d8]/50 text-pencil hover:bg-[#e5e0d8]",
        link: "border-transparent bg-transparent text-ballpoint underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
        style: {
          borderRadius: "155px 25px 135px 25px / 25px 145px 25px 135px",
        },
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
