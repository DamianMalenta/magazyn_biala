import { createContext } from 'react'
import type { MusicStation } from '../lib/musicUtils'

export interface MusicContextValue {
  current: MusicStation | null
  playing: boolean
  buffering: boolean
  reconnecting: boolean
  volume: number
  error: string | null
  playerExpanded: boolean
  setVolume: (v: number) => void
  setPlayerExpanded: (v: boolean) => void
  playStation: (station: MusicStation) => Promise<void>
  togglePlay: () => Promise<void>
  stop: () => void
  clearError: () => void
}

export const MusicContext = createContext<MusicContextValue | null>(null)
