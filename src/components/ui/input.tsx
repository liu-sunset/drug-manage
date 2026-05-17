import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 border-[3px] border-pencil bg-white px-3 font-body text-base transition-all duration-100 outline-none placeholder:text-pencil/40 focus-visible:border-ballpoint focus-visible:shadow-hard-sm disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#e5e0d8]/50 disabled:opacity-50",
        className
      )}
      style={{
        borderRadius: "185px 25px 155px 25px / 25px 175px 25px 165px",
        ...style,
      }}
      {...props}
    />
  )
}

export { Input }
