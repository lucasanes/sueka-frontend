import { X } from 'lucide-react'
import type { RoomState } from '../types'
import { CardView } from './CardView'

type HistoryDeckProps = {
  room: RoomState
  viewerTeamLabel: string
  historyOpen: boolean
  onToggle: () => void
  onClose: () => void
}

export function HistoryDeck({ room, viewerTeamLabel, historyOpen, onToggle, onClose }: HistoryDeckProps) {
  return (
    <>
      <div className="absolute right-5 top-3 z-20">
        <button className="history-deck group relative" onClick={onToggle} type="button">
          <span className="history-deck-layer history-deck-layer-back" />
          <span className="history-deck-layer history-deck-layer-mid" />
          <span className="history-deck-layer history-deck-layer-front">
            <span className="history-deck-label">{room.viewerSeat === -1 ? 'Vazas' : viewerTeamLabel}</span>
          </span>
        </button>
      </div>

      {historyOpen && (
        <div className="history-popover absolute max-w-100 top-5 right-5 z-30 flex max-h-[calc(100dvh-16rem)] flex-col overflow-hidden rounded-2xl border p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">Vazas ganhas</p>
              <p className="text-lg font-black text-white">{room.viewerSeat === -1 ? 'Sente para acompanhar' : viewerTeamLabel}</p>
            </div>
            <button className="history-close" onClick={onClose} type="button">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="history-scroll min-h-0 space-y-4 overflow-y-auto pr-1">
            {room.viewerSeat === -1 && <p className="text-sm text-emerald-100">Sente em um lugar para ver as vazas da sua dupla.</p>}
            {room.viewerSeat !== -1 && room.wonTricks.length === 0 && (
              <p className="text-sm text-emerald-100">Sua dupla ainda não venceu nenhuma vaza nesta rodada.</p>
            )}
            {room.wonTricks.map((trick) => (
              <div className="history-trick" key={`won-trick-${trick.trickNumber}`}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-white">Vaza {trick.trickNumber}</p>
                  <span className="history-points">{trick.points} pts</span>
                </div>
                <div className="history-hand">
                  {trick.cards.map((play) => (
                    <div className="history-mini-card" key={`${trick.trickNumber}-${play.playerId}-${play.card.id}`}>
                      <CardView card={play.card} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-emerald-100">
                  {trick.cards.map((play) => room.seats[play.seatIndex]?.name ?? `Lugar ${play.seatIndex + 1}`).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
