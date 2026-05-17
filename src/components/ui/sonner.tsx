"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" strokeWidth={2.5} />
        ),
        info: (
          <InfoIcon className="size-4" strokeWidth={2.5} />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" strokeWidth={2.5} />
        ),
        error: (
          <OctagonXIcon className="size-4" strokeWidth={2.5} />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" strokeWidth={2.5} />
        ),
      }}
      style={{
        "--normal-bg": "#ffffff",
        "--normal-text": "#2d2d2d",
        "--normal-border": "#2d2d2d",
        "--border-radius": "0px",
        fontFamily: '"Patrick Hand", cursive',
      } as React.CSSProperties}
      toastOptions={{
        classNames: {
          toast: "!border-[3px] !border-[#2d2d2d] !shadow-hard !rounded-[255px_15px_225px_15px/15px_225px_15px_255px] !font-body",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
