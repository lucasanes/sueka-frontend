import { useEffect, useState } from 'react'
import { THEME_KEY } from '../constants'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'))

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.body.classList.toggle('theme-dark', theme === 'dark')
  }, [theme])

  return { theme, setTheme }
}

