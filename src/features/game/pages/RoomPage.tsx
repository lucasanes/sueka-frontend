import { Copy, LogOut, Play, RotateCcw } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/utils'
import { suitLabel, suitSymbol } from '../constants'
import type { Card, GameEvent, RoomState } from '../types'
import { CardView } from '../components/CardView'
import { HistoryDeck } from '../components/HistoryDeck'
import { SeatPanel } from '../components/SeatPanel'
import { useState } from 'react'

type GroupedHand = {
  suit: string
  cards: Card[]
}

type RoomPageProps = {
  room: RoomState
  events: GameEvent[]
  error: string
  canStart: boolean
  isOwner: boolean
  isViewerTurn: boolean
  activeSeatName: string
  groupedHand: GroupedHand[]
  lowPointsPrompt: { handPoints: number; roundKey: string } | null
  viewerTeamLabel: string
  onCopyRoomCode: () => void
  onTakeSeat: (seatIndex: number) => void
  onAddBot: (seatIndex: number) => void
  onDismissLowPointsPrompt: () => void
  onPlayCard: (cardId: string) => void
  onStartGame: () => void
  onRestartGame: () => void
  onRestartMatch: () => void
  onLeaveRoom: () => void
}

function trickPositionClass(seatIndex: number, viewerSeat: number) {
  const relativeSeat = viewerSeat === -1 ? seatIndex : (seatIndex - viewerSeat + 4) % 4
  const positions = [
    'bottom-0 left-1/2 -translate-x-1/2',
    'left-0 top-1/2 -translate-y-1/2',
    'left-1/2 top-0 -translate-x-1/2',
    'right-0 top-1/2 -translate-y-1/2',
  ]

  return positions[relativeSeat]
}

export function RoomPage({
  room,
  events,
  error,
  canStart,
  isOwner,
  isViewerTurn,
  activeSeatName,
  groupedHand,
  lowPointsPrompt,
  viewerTeamLabel,
  onCopyRoomCode,
  onTakeSeat,
  onAddBot,
  onDismissLowPointsPrompt,
  onPlayCard,
  onStartGame,
  onRestartGame,
  onRestartMatch,
  onLeaveRoom,
}: RoomPageProps) {
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <div className="grid flex-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
      <aside className="space-y-4">
        <div className="theme-surface rounded-md border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="theme-caption text-xs font-bold uppercase text-zinc-500">Sala</p>
              <p className="theme-heading text-2xl font-black text-zinc-950">{room.roomCode}</p>
            </div>
            <Button onClick={onCopyRoomCode} size="sm" variant="secondary">
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
          </div>
          <p className="theme-text-soft text-sm text-zinc-600">
            {room.status === 'lobby' && 'Escolham os lugares. Assentos opostos formam uma dupla.'}
            {room.status === 'playing' && `Vaza ${room.trickNumber} de 10. ${activeSeatName !== '' ? `Vez de ${activeSeatName}.` : ''}`}
            {room.status === 'finished' && (room.winnerTeam === null ? 'A partida terminou empatada.' : `Dupla ${room.winnerTeam + 1} venceu.`)}
          </p>
        </div>

        <div className="theme-surface rounded-md border bg-white p-4 shadow-sm">
          <p className="theme-caption mb-3 text-sm font-bold uppercase text-zinc-500">Pontos</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="score-card score-card-team1 rounded-md bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-900">Dupla 1</p>
              <p className="text-3xl font-black text-emerald-950">{room.scores[0]}</p>
            </div>
            <div className="score-card score-card-team2 rounded-md bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-900">Dupla 2</p>
              <p className="text-3xl font-black text-red-950">{room.scores[1]}</p>
            </div>
          </div>
        </div>

        <div className="theme-surface rounded-md border bg-white p-4 shadow-sm">
          <p className="theme-caption mb-3 text-sm font-bold uppercase text-zinc-500">Placar da Sueka</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="score-card score-card-team1 rounded-md bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-900">Dupla 1</p>
              <p className="text-3xl font-black text-emerald-950">{room.matchScore[0]}</p>
            </div>
            <div className="score-card score-card-team2 rounded-md bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-900">Dupla 2</p>
              <p className="text-3xl font-black text-red-950">{room.matchScore[1]}</p>
            </div>
          </div>
          <p className="theme-muted-panel mt-3 rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-800">
            {room.matchWinnerTeam === null
              ? `Meta: 4 pontos. Proxima rodada vale ${room.nextRoundStake}.`
              : `Dupla ${room.matchWinnerTeam + 1} fechou a Sueka. Iniciar ou Reiniciar partida comecam um novo placar.`}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Button className="flex-1" disabled={!canStart} onClick={onStartGame}>
              <Play className="h-4 w-4" />
              Iniciar
            </Button>
            <Button className="flex-1" disabled={!isOwner} onClick={onRestartGame} variant="secondary">
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
          </div>
          <Button className="w-full" disabled={!isOwner} onClick={onRestartMatch} variant="danger">
            <RotateCcw className="h-4 w-4" />
            Reiniciar partida
          </Button>
        </div>

        <Button className="w-full" onClick={onLeaveRoom} variant="ghost">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </aside>

      <section className="relative flex min-h-[520px] flex-col rounded-md border bg-emerald-900 p-3 text-white shadow-sm sm:min-h-[620px] sm:p-5">

        <div className="grid grid-cols-2 gap-2 min-[640px]:grid-cols-4">
          {room.seats.map((seat, index) => (
            <SeatPanel
              active={room.currentTurnSeat === index}
              index={index}
              key={index}
              locked={room.status !== 'lobby'}
              onAddBot={onAddBot}
              onTakeSeat={onTakeSeat}
              seat={seat}
              viewerSeat={room.viewerSeat}
            />
          ))}
        </div>

        <div className="relative min-h-60 my-4 flex flex-1 flex-col items-center justify-center rounded-md border border-emerald-700 bg-emerald-800 p-3 sm:p-4">
          <HistoryDeck historyOpen={historyOpen} onClose={() => setHistoryOpen(false)} onToggle={() => setHistoryOpen((current) => !current)} room={room} viewerTeamLabel={viewerTeamLabel} />

          <p className="mb-4 text-sm font-bold uppercase text-emerald-100">Vaza atual</p>
          {room.currentTrick.length > 0 ? (
            <div className="relative h-72 w-full max-w-xs sm:h-96 sm:max-w-xl">
              <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-md border border-emerald-600 bg-emerald-700/80 sm:h-24 sm:w-24" />
              {room.currentTrick.map((play) => (
                <div className={cn('absolute text-center', trickPositionClass(play.seatIndex, room.viewerSeat))} key={`${play.playerId}-${play.card.id}`}>
                  <CardView card={play.card} dimmedWhenDisabled={false} disabled />
                  <p className="mt-2 max-w-20 truncate text-xs font-semibold text-emerald-50 sm:max-w-24">
                    {room.seats[play.seatIndex]?.name ?? `Lugar ${play.seatIndex + 1}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-emerald-100">{room.status === 'playing' ? `${activeSeatName} puxa a próxima carta.` : 'A mesa está pronta.'}</p>
          )}
        </div>

        <div>
          {room.trump && (
            <p className="mb-3 rounded-md border border-emerald-700 bg-emerald-800 px-3 py-2 text-sm font-semibold text-emerald-50">
              Trunfo: {suitSymbol[room.trump]} {suitLabel[room.trump]}
            </p>
          )}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold uppercase text-emerald-100">Sua mão</p>
            <p className="text-sm text-emerald-50">
              {room.viewerSeat === -1 ? 'Sente para jogar.' : isViewerTurn ? 'Sua vez.' : 'Aguarde sua vez.'}
            </p>
          </div>
          {lowPointsPrompt && (
            <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-zinc-900 shadow-sm">
              <p className="text-sm font-bold text-amber-950">Sua mão tem menos de 10 pontos.</p>
              <p className="mt-1 text-sm text-amber-900">Você pode arriar a rodada agora ou seguir com essa mão.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={onRestartGame} size="sm" variant="danger">
                  Arriar
                </Button>
                <Button onClick={onDismissLowPointsPrompt} size="sm" variant="secondary">
                  Seguir
                </Button>
              </div>
            </div>
          )}
          <div className="flex min-h-32 flex-wrap gap-3 pb-2 sm:gap-4">
            {groupedHand.flatMap((group) =>
              group.cards.map((card) => {
                const playable = room.playableCardIds.includes(card.id)
                return <CardView card={card} disabled={!playable} isPlayable={playable} key={card.id} onClick={() => onPlayCard(card.id)} />
              }),
            )}
            {room.hand.length === 0 && <p className="text-sm text-emerald-100">Nenhuma carta na mão.</p>}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
        <div className="theme-surface rounded-md border bg-white p-4 shadow-sm">
          <p className="theme-caption mb-3 text-sm font-bold uppercase text-zinc-500">Eventos</p>
          <div className="space-y-3">
            {events.length === 0 && <p className="theme-text-soft text-sm text-zinc-600">Os eventos da sala aparecem aqui.</p>}
            {events.map((event) => (
              <p className="theme-muted-panel rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700" key={event.id}>
                {event.message}
              </p>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
