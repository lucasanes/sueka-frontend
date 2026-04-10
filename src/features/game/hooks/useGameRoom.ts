import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { io, type Socket } from 'socket.io-client'
import { NAME_KEY, SERVER_URL, rankOrder, suitOrder } from '../constants'
import { clearStoredSession, goTo, readStoredSession, roomCodeFromPath, writeStoredSession } from '../lib/navigation'
import type { Credentials, GameEvent, RoomState } from '../types'

export function useGameRoom() {
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
  const [dismissedLowPointsRoundKey, setDismissedLowPointsRoundKey] = useState<string | null>(null)

  function attemptJoinFromRoute(socket: Socket) {
    const routeRoomCode = roomCodeFromPath()
    if (!routeRoomCode || attemptedReconnectRef.current) {
      return
    }

    const stored = readStoredSession()
    const fallbackName = playerNameRef.current.trim() || localStorage.getItem(NAME_KEY)?.trim() || ''
    const shouldRestoreSession = stored?.roomCode === routeRoomCode && Boolean(stored.sessionToken)
    const playerName = shouldRestoreSession ? (stored?.playerName ?? fallbackName) : fallbackName

    if (!playerName) {
      return
    }

    attemptedReconnectRef.current = true
    socket.emit('room:join', {
      roomCode: routeRoomCode,
      playerName,
      sessionToken: shouldRestoreSession ? stored?.sessionToken : undefined,
    })
  }

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
        clearStoredSession()
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
      attemptJoinFromRoute(socket)
    })

    socket.on('disconnect', () => setConnected(false))
    socket.on('room:joined', (joined: Credentials) => {
      setCredentials(joined)
      setRoomCodeInput(joined.roomCode)
      writeStoredSession({ ...joined, playerName: playerNameRef.current })
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
    socket.on('room:error', ({ message }: { message: string }) => {
      const routeRoomCode = roomCodeFromPath()
      const stored = readStoredSession()
      if (stored?.roomCode === routeRoomCode) {
        clearStoredSession()
      }
      attemptedReconnectRef.current = false
      setError(message)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    const routeRoomCode = roomCodeFromPath()
    if (!routeRoomCode) {
      return
    }

    if (connected && !room && !attemptedReconnectRef.current) {
      const socket = socketRef.current
      if (socket) {
        attemptJoinFromRoute(socket)
      }
    }
  }, [connected, path, room])

  const isOwner = Boolean(room && credentials?.playerId === room.ownerId)
  const canStart = Boolean(isOwner && room && room.status !== 'playing' && room.seats.every(Boolean))
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

  const viewerTeamLabel = useMemo(() => {
    if (!room || room.viewerSeat === -1) {
      return ''
    }
    return `Dupla ${room.viewerSeat % 2 + 1}`
  }, [room])

  const lowPointsPrompt = useMemo(() => {
    if (!room || room.status !== 'playing' || room.viewerSeat === -1) {
      return null
    }

    const isOpeningLead = room.trickNumber === 1 && room.currentTrick.length === 0
    const isStarter = room.currentTurnSeat === room.viewerSeat
    if (!isOpeningLead || !isStarter) {
      return null
    }

    const handPoints = room.hand.reduce((sum, card) => sum + card.points, 0)
    if (handPoints >= 10) {
      return null
    }

    const roundKey = `${room.roomCode}:${room.trickNumber}:${room.hand.map((card) => card.id).sort().join('|')}`
    if (dismissedLowPointsRoundKey === roundKey) {
      return null
    }

    return { handPoints, roundKey }
  }, [dismissedLowPointsRoundKey, room])

  function rememberName() {
    const stored = readStoredSession()
    if (stored) {
      writeStoredSession({ ...stored, playerName })
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
    clearStoredSession()
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

  return {
    playerName,
    setPlayerName,
    roomCodeInput,
    setRoomCodeInput,
    room,
    events,
    error,
    connected,
    isOwner,
    canStart,
    isViewerTurn,
    activeSeatName,
    groupedHand,
    viewerTeamLabel,
    createRoom,
    joinRoom,
    leaveRoom,
    copyRoomCode,
    lowPointsPrompt,
    dismissLowPointsPrompt: () => setDismissedLowPointsRoundKey(lowPointsPrompt?.roundKey ?? null),
    takeSeat: (seatIndex: number) => socketRef.current?.emit('seat:take', { seatIndex }),
    addBot: (seatIndex: number) => socketRef.current?.emit('seat:add-bot', { seatIndex }),
    playCard: (cardId: string) => socketRef.current?.emit('card:play', { cardId }),
    startGame: () => socketRef.current?.emit('game:start'),
    restartGame: () => socketRef.current?.emit('game:restart'),
    restartMatch: () => socketRef.current?.emit('game:restart-match'),
  }
}
