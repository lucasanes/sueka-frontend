import { SESSION_KEY } from '../constants'
import type { StoredSession } from '../types'

export function readStoredSession() {
  const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as StoredSession
    localStorage.setItem(SESSION_KEY, JSON.stringify(parsed))
    sessionStorage.removeItem(SESSION_KEY)
    return parsed
  } catch {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function writeStoredSession(session: StoredSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  sessionStorage.removeItem(SESSION_KEY)
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function roomCodeFromPath() {
  const match = window.location.pathname.match(/^\/room\/([A-Z0-9]{6})$/i)
  return match?.[1].toUpperCase() ?? ''
}

export function goTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
