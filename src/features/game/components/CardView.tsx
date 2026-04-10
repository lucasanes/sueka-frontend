import { cn } from '../../../lib/utils'
import { suitSymbol } from '../constants'
import type { Card } from '../types'

type CardViewProps = {
  card: Card
  disabled?: boolean
  isPlayable?: boolean
  dimmedWhenDisabled?: boolean
  onClick?: () => void
}

export function CardView({
  card,
  disabled = false,
  isPlayable = false,
  dimmedWhenDisabled = true,
  onClick,
}: CardViewProps) {
  const red = card.suit === 'diamonds' || card.suit === 'hearts'

  return (
    <button
      className={cn(
        'flex aspect-[5/7] min-h-20 w-14 flex-col justify-between rounded-md border bg-white p-2 text-left shadow-sm transition sm:min-h-24 sm:w-16 lg:min-h-28 lg:w-20',
        red ? 'text-red-700' : 'text-zinc-950',
        isPlayable && 'border-emerald-600 ring-2 ring-emerald-600/20 hover:-translate-y-1 hover:shadow-lg',
        disabled && 'cursor-not-allowed',
        disabled && dimmedWhenDisabled && 'opacity-60',
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <span className="text-sm font-black leading-none sm:text-base lg:text-lg">{card.rank}</span>
      <span className="self-center text-2xl leading-none sm:text-3xl lg:text-4xl">{suitSymbol[card.suit]}</span>
      <span className="self-end text-[10px] font-bold sm:text-xs">{card.points} pts</span>
    </button>
  )
}

