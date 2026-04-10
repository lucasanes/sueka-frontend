import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold shadow-sm transition-[background-color,border-color,color,box-shadow] duration-180 ease-out hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:hover:shadow-sm',
  {
    variants: {
      variant: {
        default: 'border focus-visible:outline-[var(--button-default-outline)]',
        secondary: 'border focus-visible:outline-[var(--button-secondary-outline)]',
        danger: 'border focus-visible:outline-[var(--button-danger-outline)]',
        ghost: 'border shadow-none hover:shadow-sm focus-visible:outline-[var(--button-ghost-outline)]',
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
