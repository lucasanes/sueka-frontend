import { useEffect, useState } from 'react'

export type AppRoute =
  | { name: 'home' }
  | { name: 'room'; roomCode: string }

function matchRoute(pathname: string): AppRoute {
  const roomMatch = pathname.match(/^\/room\/([A-Z0-9]{6})$/i)
  if (roomMatch) {
    return { name: 'room', roomCode: roomMatch[1].toUpperCase() }
  }

  return { name: 'home' }
}

export function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>(() => matchRoute(window.location.pathname))

  useEffect(() => {
    const updateRoute = () => setRoute(matchRoute(window.location.pathname))
    window.addEventListener('popstate', updateRoute)
    return () => window.removeEventListener('popstate', updateRoute)
  }, [])

  return route
}

