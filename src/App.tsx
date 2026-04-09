import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Copy, Crown, LogOut, Play, RotateCcw, Wifi, WifiOff } from 'lucide-react'
import { io, type Socket } from 'socket.io-client'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { cn } from './lib/utils'
import './App.css'

type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades'
type RoomStatus = 'lobby' | 'playing' | 'finished'

type Card = {
  id: string
  rank: string
  suit: Suit
  points: number
}

type Seat = {
  id: string
  name: string
  connected: boolean
  isOwner: boolean
  handCount: number
  team: number
} | null

type TrickPlay = {
  seatIndex: number
  playerId: string
  card: Card
}

type GameEvent = {
  id: string
  message: string
  at: number
}

type RoomState = {
  roomCode: string
  status: RoomStatus
  ownerId: string
  viewerId: string
  viewerSeat: number
  seats: Seat[]
  trump: Suit | null
  currentTurnSeat: number | null
  currentTrick: TrickPlay[]
  trickNumber: number
  scores: [number, number]
  winnerTeam: number | null
  matchScore: [number, number]
  nextRoundStake: number
  matchWinnerTeam: number | null
  hand: Card[]
  playableCardIds: string[]
  lastEvent: GameEvent | null
}

type Credentials = {
  roomCode: string
  playerId: string
  sessionToken: string
}

type StoredSession = Credentials & {
  playerName?: string
}

const SERVER_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3333'
const SESSION_KEY = 'sueka-tab-session'
const NAME_KEY = 'sueka-player-name'
const suitLabel: Record<Suit, string> = {
  clubs: 'Paus',
  diamonds: 'Ouros',
  hearts: 'Copas',
  spades: 'Espadas',
}
const suitSymbol: Record<Suit, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
}
const suitOrder: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades']
const rankOrder = new Map(['2', '3', '4', '5', '6', 'Q', 'J', 'K', '7', 'A'].map((rank, index) => [rank, index]))

function readStoredSession() {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

function roomCodeFromPath() {
  const match = window.location.pathname.match(/^\/room\/([A-Z0-9]{6})$/i)
  return match?.[1].toUpperCase() ?? ''
}

function goTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function CardView({
  card,
  disabled = false,
  isPlayable = false,
  onClick,
}: {
  card: Card
  disabled?: boolean
  isPlayable?: boolean
  onClick?: () => void
}) {
  const red = card.suit === 'diamonds' || card.suit === 'hearts'

  return (
    <button
      className={cn(
        'flex aspect-[5/7] min-h-20 w-14 flex-col justify-between rounded-md border bg-white p-2 text-left shadow-sm transition sm:min-h-24 sm:w-16 lg:min-h-28 lg:w-20',
        red ? 'text-red-700' : 'text-zinc-950',
        isPlayable && 'border-emerald-600 ring-2 ring-emerald-600/20 hover:-translate-y-1 hover:shadow-lg',
        disabled && 'cursor-not-allowed opacity-60',
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

function SeatPanel({
  seat,
  index,
  active,
  viewerSeat,
  onTakeSeat,
  locked,
}: {
  seat: Seat
  index: number
  active: boolean
  viewerSeat: number
  onTakeSeat: (seatIndex: number) => void
  locked: boolean
}) {
  return (
    <div
      className={cn(
        'min-h-16 rounded-md border bg-white p-2 text-zinc-950 shadow-sm sm:min-h-20',
        active && 'border-emerald-700 bg-emerald-200 ring-2 ring-emerald-700/30',
        viewerSeat === index && 'border-zinc-950',
      )}
    >
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1 sm:mb-2">
        <span className="text-xs font-bold uppercase text-zinc-500">Lugar {index + 1}</span>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 sm:text-xs">
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
          <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-950 sm:text-base">
            {seat.isOwner && <Crown className="h-3.5 w-3.5 text-amber-600 sm:h-4 sm:w-4" />}
            <span className="truncate leading-tight">{seat.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-600 sm:text-sm">
            <span>{seat.handCount} cartas</span>
            {seat.connected ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-700 sm:h-4 sm:w-4" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-red-700 sm:h-4 sm:w-4" />
            )}
          </div>
        </div>
      ) : (
        <Button className="h-8 w-full text-xs" disabled={locked} onClick={() => onTakeSeat(index)} size="sm" variant="secondary">
          Sentar aqui
        </Button>
      )}
    </div>
  )
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

function App() {
  const socketRef = useRef<Socket | null>(null)
  const playerNameRef = useRef('')
  const attemptedReconnectRef = useRef(false)
  const [path, setPath] = useState(() => window.location.pathname)
  const [playerName, setPlayerName] = useState(() => readStoredSession()?.playerName ?? localStorage.getItem(NAME_KEY) ?? '')
  const [roomCodeInput, setRoomCodeInput] = useState(() => roomCodeFromPath())
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [room, setRoom] = useState<RoomState | null>(null)
  const [events, setEvents] = useState<GameEvent[]>([])
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    playerNameRef.current = playerName
    localStorage.setItem(NAME_KEY, playerName)
  }, [playerName])

  useEffect(() => {
    const updatePath = () => {
      const routeRoomCode = roomCodeFromPath()
      setPath(window.location.pathname)
      setRoomCodeInput(routeRoomCode)

      if (!routeRoomCode) {
        attemptedReconnectRef.current = false
        setRoom(null)
        setCredentials(null)
        setEvents([])
        setError('')
      }
    }

    window.addEventListener('popstate', updatePath)
    return () => window.removeEventListener('popstate', updatePath)
  }, [])

  useEffect(() => {
    const socket = io(SERVER_URL, { autoConnect: true })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      const routeRoomCode = roomCodeFromPath()
      const stored = readStoredSession()
      if (routeRoomCode && stored?.roomCode === routeRoomCode && !attemptedReconnectRef.current) {
        attemptedReconnectRef.current = true
        socket.emit('room:join', {
          roomCode: stored.roomCode,
          playerName: stored.playerName ?? playerNameRef.current,
          sessionToken: stored.sessionToken,
        })
      }
    })
    socket.on('disconnect', () => setConnected(false))
    socket.on('room:joined', (joined: Credentials) => {
      setCredentials(joined)
      setRoomCodeInput(joined.roomCode)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...joined, playerName: playerNameRef.current }))
      if (roomCodeFromPath() !== joined.roomCode) {
        goTo(`/room/${joined.roomCode}`)
      }
    })
    socket.on('room:state', (state: RoomState) => {
      setRoom(state)
      setError('')
    })
    socket.on('game:event', (event: GameEvent) => {
      setEvents((current) => [event, ...current.filter((item) => item.id !== event.id)].slice(0, 5))
    })
    socket.on('room:error', ({ message }: { message: string }) => setError(message))

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    const routeRoomCode = roomCodeFromPath()
    if (!routeRoomCode) {
      return
    }

    const stored = readStoredSession()
    if (stored?.roomCode === routeRoomCode && connected && !room && !attemptedReconnectRef.current) {
      const socket = socketRef.current
      if (socket) {
        attemptedReconnectRef.current = true
        socket.emit('room:join', {
          roomCode: stored.roomCode,
          playerName: stored.playerName ?? playerNameRef.current,
          sessionToken: stored.sessionToken,
        })
      }
    }
  }, [connected, path, room])

  const isOwner = Boolean(room && credentials?.playerId === room.ownerId)
  const canStart = Boolean(isOwner && room?.status === 'lobby' && room.seats.every(Boolean))
  const isViewerTurn = room?.status === 'playing' && room.viewerSeat === room.currentTurnSeat
  const activeSeatName = useMemo(() => {
    if (!room || room.currentTurnSeat === null) {
      return ''
    }
    return room.seats[room.currentTurnSeat]?.name ?? ''
  }, [room])
  const groupedHand = useMemo(() => {
    if (!room) {
      return []
    }

    return suitOrder
      .map((suit) => ({
        suit,
        cards: room.hand
          .filter((card) => card.suit === suit)
          .toSorted((left, right) => (rankOrder.get(left.rank) ?? 0) - (rankOrder.get(right.rank) ?? 0)),
      }))
      .filter((group) => group.cards.length > 0)
  }, [room])

  function rememberName() {
    const stored = readStoredSession()
    if (stored) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...stored, playerName }))
    }
    localStorage.setItem(NAME_KEY, playerName)
  }

  function createRoom(event: FormEvent) {
    event.preventDefault()
    setError('')
    rememberName()
    socketRef.current?.emit('room:create', { playerName })
  }

  function joinRoom(event?: FormEvent) {
    event?.preventDefault()
    setError('')
    rememberName()
    const stored = readStoredSession()
    socketRef.current?.emit('room:join', {
      roomCode: roomCodeInput,
      playerName,
      sessionToken: stored?.roomCode === roomCodeInput.toUpperCase() ? stored.sessionToken : undefined,
    })
  }

  function leaveRoom() {
    socketRef.current?.emit('room:leave')
    sessionStorage.removeItem(SESSION_KEY)
    setCredentials(null)
    setRoom(null)
    setEvents([])
    goTo('/')
  }

  function copyRoomCode() {
    if (room?.roomCode) {
      void navigator.clipboard?.writeText(room.roomCode)
    }
  }

  return (
    <main className="min-h-svh">
      <section className="mx-auto flex min-h-svh w-full flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-sm font-bold uppercase text-emerald-800">Sueka online</p>
            <h1 className="text-3xl font-black text-zinc-950 sm:text-4xl">Mesa para quatro amigos</h1>
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-zinc-700">
            {connected ? <Wifi className="h-4 w-4 text-emerald-700" /> : <WifiOff className="h-4 w-4 text-red-700" />}
            {connected ? 'Conectado' : 'Sem conexão'}
          </div>
        </header>

        {!room ? (
          <div className="grid flex-1 items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <p className="max-w-2xl text-lg text-zinc-700">
                Crie uma sala, compartilhe o código e jogue Sueka em duplas. O servidor guarda a partida em memória e cada
                pessoa vê só a própria mão.
              </p>
              <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
                <div className="rounded-md border bg-white p-4">
                  <p className="text-2xl font-black text-zinc-950">40</p>
                  <p className="text-sm text-zinc-600">cartas no baralho</p>
                </div>
                <div className="rounded-md border bg-white p-4">
                  <p className="text-2xl font-black text-zinc-950">4</p>
                  <p className="text-sm text-zinc-600">jogadores sentados</p>
                </div>
                <div className="rounded-md border bg-white p-4">
                  <p className="text-2xl font-black text-zinc-950">2</p>
                  <p className="text-sm text-zinc-600">duplas opostas</p>
                </div>
              </div>
            </div>

            <div className="rounded-md border bg-white p-5 shadow-sm">
              <form className="space-y-4" onSubmit={roomCodeInput ? joinRoom : createRoom}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-800" htmlFor="player-name">
                    Seu nome
                  </label>
                  <Input
                    id="player-name"
                    maxLength={24}
                    onChange={(event) => setPlayerName(event.target.value)}
                    placeholder="Ex: Lucas"
                    value={playerName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-800" htmlFor="room-code">
                    Código da sala
                  </label>
                  <Input
                    id="room-code"
                    maxLength={6}
                    onChange={(event) => setRoomCodeInput(event.target.value.toUpperCase())}
                    placeholder="Deixe vazio para criar"
                    value={roomCodeInput}
                  />
                </div>

                {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

                <div className="grid gap-2 sm:grid-cols-2">
                  <Button disabled={!playerName.trim()} onClick={createRoom} type="button">
                    Criar sala
                  </Button>
                  <Button disabled={!playerName.trim() || !roomCodeInput.trim()} type="submit" variant="secondary">
                    Entrar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="grid flex-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
            <aside className="space-y-4">
              <div className="rounded-md border bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-zinc-500">Sala</p>
                    <p className="text-2xl font-black text-zinc-950">{room.roomCode}</p>
                  </div>
                  <Button onClick={copyRoomCode} size="sm" variant="secondary">
                    <Copy className="h-4 w-4" />
                    Copiar
                  </Button>
                </div>
                <p className="text-sm text-zinc-600">
                  {room.status === 'lobby' && 'Escolham os lugares. Assentos opostos formam uma dupla.'}
                  {room.status === 'playing' && `Vaza ${room.trickNumber} de 10. Vez de ${activeSeatName}.`}
                  {room.status === 'finished' &&
                    (room.winnerTeam === null ? 'A partida terminou empatada.' : `Dupla ${room.winnerTeam + 1} venceu.`)}
                </p>
              </div>

              <div className="rounded-md border bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-bold uppercase text-zinc-500">Pontos</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-emerald-50 p-3">
                    <p className="text-xs font-semibold text-emerald-900">Dupla 1</p>
                    <p className="text-3xl font-black text-emerald-950">{room.scores[0]}</p>
                  </div>
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-900">Dupla 2</p>
                    <p className="text-3xl font-black text-red-950">{room.scores[1]}</p>
                  </div>
                </div>
                {room.trump && (
                  <p className="mt-3 rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-800">
                    Trunfo: {suitSymbol[room.trump]} {suitLabel[room.trump]}
                  </p>
                )}
              </div>

              <div className="rounded-md border bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-bold uppercase text-zinc-500">Placar da Sueka</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-emerald-50 p-3">
                    <p className="text-xs font-semibold text-emerald-900">Dupla 1</p>
                    <p className="text-3xl font-black text-emerald-950">{room.matchScore[0]}</p>
                  </div>
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-xs font-semibold text-red-900">Dupla 2</p>
                    <p className="text-3xl font-black text-red-950">{room.matchScore[1]}</p>
                  </div>
                </div>
                <p className="mt-3 rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-800">
                  {room.matchWinnerTeam === null
                    ? `Meta: 4 pontos. Proxima rodada vale ${room.nextRoundStake}.`
                    : `Dupla ${room.matchWinnerTeam + 1} fechou a Sueka. Reiniciar começa um novo placar.`}
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" disabled={!canStart} onClick={() => socketRef.current?.emit('game:start')}>
                  <Play className="h-4 w-4" />
                  Iniciar
                </Button>
                <Button
                  className="flex-1"
                  disabled={!isOwner || room.status !== 'finished'}
                  onClick={() => socketRef.current?.emit('game:restart')}
                  variant="secondary"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reiniciar
                </Button>
              </div>

              <Button className="w-full" onClick={leaveRoom} variant="ghost">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </aside>

            <section className="flex min-h-[520px] flex-col rounded-md border bg-emerald-900 p-3 text-white shadow-sm sm:min-h-[620px] sm:p-5">
              <div className="grid grid-cols-2 gap-2 min-[640px]:grid-cols-4">
                {room.seats.map((seat, index) => (
                  <SeatPanel
                    active={room.currentTurnSeat === index}
                    index={index}
                    key={index}
                    locked={room.status !== 'lobby'}
                    onTakeSeat={(seatIndex) => socketRef.current?.emit('seat:take', { seatIndex })}
                    seat={seat}
                    viewerSeat={room.viewerSeat}
                  />
                ))}
              </div>

              <div className="my-4 flex flex-1 flex-col items-center justify-center rounded-md border border-emerald-700 bg-emerald-800 p-3 sm:my-6 sm:p-4">
                <p className="mb-4 text-sm font-bold uppercase text-emerald-100">Vaza atual</p>
                {room.currentTrick.length > 0 ? (
                  <div className="relative h-72 w-full max-w-xs sm:h-96 sm:max-w-xl">
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-md border border-emerald-600 bg-emerald-700/80 sm:h-24 sm:w-24" />
                    {room.currentTrick.map((play) => (
                      <div
                        className={cn('absolute text-center', trickPositionClass(play.seatIndex, room.viewerSeat))}
                        key={`${play.playerId}-${play.card.id}`}
                      >
                        <CardView card={play.card} disabled />
                        <p className="mt-2 max-w-20 truncate text-xs font-semibold text-emerald-50 sm:max-w-24">
                          {room.seats[play.seatIndex]?.name ?? `Lugar ${play.seatIndex + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-emerald-100">
                    {room.status === 'playing' ? `${activeSeatName} puxa a próxima carta.` : 'A mesa está pronta.'}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold uppercase text-emerald-100">Sua mão</p>
                  <p className="text-sm text-emerald-50">
                    {room.viewerSeat === -1 ? 'Sente para jogar.' : isViewerTurn ? 'Sua vez.' : 'Aguarde sua vez.'}
                  </p>
                </div>
                <div className="flex min-h-32 flex-wrap gap-3 pb-2 sm:gap-4">
                  {groupedHand.map((group) => (
                    <div className="min-w-0 flex-1 basis-36" key={group.suit}>
                      <p className="mb-2 text-xs font-bold uppercase text-emerald-100">
                        {suitSymbol[group.suit]} {suitLabel[group.suit]}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.cards.map((card) => {
                          const playable = room.playableCardIds.includes(card.id)
                          return (
                            <CardView
                              card={card}
                              disabled={!playable}
                              isPlayable={playable}
                              key={card.id}
                              onClick={() => socketRef.current?.emit('card:play', { cardId: card.id })}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {room.hand.length === 0 && <p className="text-sm text-emerald-100">Nenhuma carta na mão.</p>}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
              <div className="rounded-md border bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-bold uppercase text-zinc-500">Eventos</p>
                <div className="space-y-3">
                  {events.length === 0 && <p className="text-sm text-zinc-600">Os eventos da sala aparecem aqui.</p>}
                  {events.map((event) => (
                    <p className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700" key={event.id}>
                      {event.message}
                    </p>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
