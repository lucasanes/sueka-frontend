import { SESSION_KEY } from '../constants'
import type { StoredSession } from '../types'

export function readStoredSession() {
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

export function roomCodeFromPath() {
  const match = window.location.pathname.match(/^\/room\/([A-Z0-9]{6})$/i)
  return match?.[1].toUpperCase() ?? ''
}

export function goTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
