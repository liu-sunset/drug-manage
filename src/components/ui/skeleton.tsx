import { cn } from "@/lib/utils"

function Skeleton({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse bg-[#e5e0d8]", className)}
      style={{
        borderRadius: "185px 25px 155px 25px / 25px 175px 25px 165px",
        ...style,
      }}
      {...props}
    />
  )
}

export { Skeleton }
