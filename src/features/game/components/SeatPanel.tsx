import { Crown, Wifi, WifiOff } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/utils'
import type { Seat } from '../types'

type SeatPanelProps = {
  seat: Seat
  index: number
  active: boolean
  viewerSeat: number
  onTakeSeat: (seatIndex: number) => void
  onAddBot: (seatIndex: number) => void
  locked: boolean
}

export function SeatPanel({ seat, index, active, viewerSeat, onTakeSeat, onAddBot, locked }: SeatPanelProps) {
  const canReplaceBot = Boolean(seat && seat.kind === 'bot' && !locked)

  return (
    <div
      className={cn(
        'seat-panel min-h-16 rounded-md border bg-white p-2 text-zinc-950 shadow-sm sm:min-h-20',
        active && 'seat-panel-active border-emerald-700 ring-2 ring-emerald-700/30',
        viewerSeat === index && 'seat-panel-viewer border-zinc-950',
      )}
    >
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 sm:mb-2">
        <span className="seat-panel-caption text-xs font-bold uppercase text-zinc-500">Lugar {index + 1}</span>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <span className="seat-panel-badge rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 sm:text-xs">
            Dupla {index % 2 + 1}
          </span>
          {active && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Vez
            </span>
          )}
        </div>
      </div>

      {seat ? (
        <div className="space-y-0.5 sm:space-y-1">
          <div className="seat-panel-name flex items-center gap-1.5 text-sm font-bold text-zinc-950 sm:text-base">
            {seat.isOwner && <Crown className="h-3.5 w-3.5 text-amber-600 sm:h-4 sm:w-4" />}
            <span className="truncate leading-tight">{seat.name}</span>
            {seat.kind === 'bot' && <span className="seat-panel-bot rounded px-1.5 py-0.5 text-[10px] font-bold uppercase">Bot</span>}
          </div>
          <div className="seat-panel-meta flex items-center justify-between text-xs text-zinc-600 sm:text-sm">
            <span>{seat.handCount} cartas</span>
            {seat.kind === 'bot' ? (
              <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 sm:text-xs">Automatico</span>
            ) : seat.connected ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-700 sm:h-4 sm:w-4" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-700 sm:h-4 sm:w-4" />
            )}
          </div>
          {canReplaceBot && (
            <Button className="mt-2 h-8 w-full text-xs" onClick={() => onTakeSeat(index)} size="sm" variant="secondary">
              Assumir lugar
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Button className="h-8 w-full text-xs" disabled={locked} onClick={() => onTakeSeat(index)} size="sm" variant="secondary">
            Sentar aqui
          </Button>
          <Button className="h-8 w-full text-xs" disabled={locked} onClick={() => onAddBot(index)} size="sm" variant="secondary">
            Adicionar bot
          </Button>
        </div>
      )}
    </div>
  )
}

