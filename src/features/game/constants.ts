import type { Suit } from './types'

export const SERVER_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3333'
export const SESSION_KEY = 'sueka-tab-session'
export const NAME_KEY = 'sueka-player-name'

export const suitLabel: Record<Suit, string> = {
  clubs: 'Paus',
  diamonds: 'Ouros',
  hearts: 'Copas',
  spades: 'Espadas',
}

export const suitSymbol: Record<Suit, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
}

export const suitOrder: Suit[] = ['clubs', 'diamonds', 'spades', 'hearts']
export const rankOrder = new Map(['2', '3', '4', '5', '6', 'Q', 'J', 'K', '7', 'A'].map((rank, index) => [rank, index]))
