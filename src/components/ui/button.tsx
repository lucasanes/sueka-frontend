import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition-[background-color,border-color,color,box-shadow,transform] duration-180 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm',
  {
    variants: {
      variant: {
        default: 'border border-emerald-800 bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:outline-emerald-700',
        secondary: 'border border-zinc-300 bg-white text-zinc-950 hover:border-zinc-400 hover:bg-zinc-100 focus-visible:outline-zinc-700',
        danger: 'border border-red-800 bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700',
        ghost: 'border border-transparent bg-transparent text-zinc-800 hover:border-zinc-200 hover:bg-zinc-100/90 hover:text-zinc-950 focus-visible:outline-zinc-700',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      data-ui-button=""
      data-ui-variant={variant ?? 'default'}
      {...props}
    />
  )
}
