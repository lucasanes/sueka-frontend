export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades'
export type RoomStatus = 'lobby' | 'playing' | 'finished'

export type Card = {
  id: string
  rank: string
  suit: Suit
  points: number
}

export type Seat = {
  id: string
  name: string
  connected: boolean
  isOwner: boolean
  kind: 'human' | 'bot'
  handCount: number
  team: number
} | null

export type TrickPlay = {
  seatIndex: number
  playerId: string
  card: Card
}

export type GameEvent = {
  id: string
  message: string
  at: number
}

export type WonTrick = {
  winnerSeat: number
  points: number
  team: number
  trickNumber: number
  cards: TrickPlay[]
}

export type RoomState = {
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
  wonTricks: WonTrick[]
  lastEvent: GameEvent | null
}

export type Credentials = {
  roomCode: string
  playerId: string
  sessionToken: string
}

export type StoredSession = Credentials & {
  playerName?: string
}

