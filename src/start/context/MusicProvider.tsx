import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  getLocalMusicStatus,
  isLocalFileSystemSupported,
  listPlaylistTracks,
  loadStoredRootHandle,
  pickMusicRootFolder,
  shuffleInPlace,
  type LocalMusicStatus,
} from '../lib/localMusic'
import {
  delay,
  isLocalFilesStation,
  loadLastStation,
  saveLastStation,
  streamUrlsForStation,
  type MusicStation,
} from '../lib/musicUtils'
import { MusicContext } from './musicContext'

const RETRIES_PER_URL = 3
const RECOVERY_DELAY_MS = 8_000

const EMPTY_LOCAL_STATUS: LocalMusicStatus = {
  connected: false,
  folderName: null,
  playlists: [],
  totalTracks: 0,
  supported: isLocalFileSystemSupported(),
}

interface LocalPlaybackState {
  station: MusicStation
  files: File[]
  index: number
  objectUrl: string | null
}

function trackTitle(file: File): string {
  return file.name.replace(/\.mp3$/i, '').replace(/^\d+-/, '')
}

function stationWithTrack(station: MusicStation, file: File): MusicStation {
  return {
    ...station,
    name: `${station.name.replace(/ — .*$/, '')} — ${trackTitle(file)}`,
  }
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<MusicStation | null>(() => loadLastStation())
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [volume, setVolume] = useState(0.75)
  const [error, setError] = useState<string | null>(null)
  const [playerExpanded, setPlayerExpanded] = useState(false)
  const [localMusic, setLocalMusic] = useState<LocalMusicStatus>(EMPTY_LOCAL_STATUS)

  const currentRef = useRef(current)
  const userPausedRef = useRef(false)
  const stoppedRef = useRef(false)
  const startingRef = useRef(false)
  const recoveringRef = useRef(false)
  const reconnectGenRef = useRef(0)
  const recoveryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootHandleRef = useRef<FileSystemDirectoryHandle | null>(null)
  const localPlaybackRef = useRef<LocalPlaybackState | null>(null)

  useEffect(() => {
    currentRef.current = current
  }, [current])

  useEffect(() => {
    const el = audioRef.current
    if (el) el.volume = volume
  }, [volume])

  const revokeLocalObjectUrl = useCallback(() => {
    const state = localPlaybackRef.current
    if (state?.objectUrl) {
      URL.revokeObjectURL(state.objectUrl)
      state.objectUrl = null
    }
  }, [])

  const clearLocalPlayback = useCallback(() => {
    revokeLocalObjectUrl()
    localPlaybackRef.current = null
  }, [revokeLocalObjectUrl])

  const refreshLocalMusic = useCallback(async () => {
    const handle = await loadStoredRootHandle()
    rootHandleRef.current = handle
    setLocalMusic(await getLocalMusicStatus(handle))
  }, [])

  useEffect(() => {
    void refreshLocalMusic()
  }, [refreshLocalMusic])

  const clearRecoveryTimer = useCallback(() => {
    if (recoveryTimerRef.current) {
      clearTimeout(recoveryTimerRef.current)
      recoveryTimerRef.current = null
    }
  }, [])

  const cancelReconnect = useCallback(() => {
    reconnectGenRef.current += 1
    clearRecoveryTimer()
    setReconnecting(false)
    setBuffering(false)
  }, [clearRecoveryTimer])

  const tryPlayUrl = useCallback(async (el: HTMLAudioElement, url: string): Promise<boolean> => {
    el.src = url
    el.load()
    try {
      await el.play()
      return true
    } catch {
      return false
    }
  }, [])

  const playLocalTrackAt = useCallback(
    async (index: number): Promise<boolean> => {
      const state = localPlaybackRef.current
      const el = audioRef.current
      if (!state || !el || index < 0 || index >= state.files.length) return false

      revokeLocalObjectUrl()
      const file = state.files[index]
      const url = URL.createObjectURL(file)
      state.index = index
      state.objectUrl = url

      setCurrent(stationWithTrack(state.station, file))

      const ok = await tryPlayUrl(el, url)
      if (!ok) {
        revokeLocalObjectUrl()
        return false
      }

      setPlaying(true)
      setBuffering(false)
      setReconnecting(false)
      setError(null)
      return true
    },
    [revokeLocalObjectUrl, tryPlayUrl],
  )

  const playNextLocalTrack = useCallback(async () => {
    const state = localPlaybackRef.current
    if (!state || stoppedRef.current || userPausedRef.current) return

    let next = state.index + 1
    if (next >= state.files.length) {
      shuffleInPlace(state.files)
      next = 0
    }

    const ok = await playLocalTrackAt(next)
    if (!ok) {
      setPlaying(false)
      setError('Nie udało się odtworzyć utworu z folderu.')
    }
  }, [playLocalTrackAt])

  const startLocalPlaylist = useCallback(
    async (station: MusicStation): Promise<boolean> => {
      const folder = station.localFolder
      if (!folder) return false

      let root = rootHandleRef.current
      if (!root) {
        root = await loadStoredRootHandle()
        rootHandleRef.current = root
      }

      if (!root) {
        setError('Wybierz folder z muzyką (przycisk powyżej listy playlist).')
        return false
      }

      const files = await listPlaylistTracks(root, folder)
      if (files.length === 0) {
        setError(`Folder „${folder}” jest pusty — uruchom npm run download:local-music.`)
        return false
      }

      clearLocalPlayback()
      localPlaybackRef.current = {
        station,
        files: shuffleInPlace([...files]),
        index: -1,
        objectUrl: null,
      }

      return playLocalTrackAt(0)
    },
    [clearLocalPlayback, playLocalTrackAt],
  )

  const reconnectStream = useCallback(async () => {
    const station = currentRef.current
    if (!station || stoppedRef.current || userPausedRef.current) return
    if (isLocalFilesStation(station) || localPlaybackRef.current) return

    const el = audioRef.current
    if (!el) return

    const gen = ++reconnectGenRef.current
    recoveringRef.current = true
    setReconnecting(true)
    setBuffering(false)
    setError(null)

    const urls = streamUrlsForStation(station)

    try {
      for (const url of urls) {
        for (let attempt = 0; attempt < RETRIES_PER_URL; attempt++) {
          if (gen !== reconnectGenRef.current || stoppedRef.current || userPausedRef.current) return
          if (attempt > 0) await delay(1000 * 2 ** (attempt - 1))
          if (gen !== reconnectGenRef.current) return

          const ok = await tryPlayUrl(el, url)
          if (ok) {
            setPlaying(true)
            setReconnecting(false)
            setError(null)
            return
          }
        }
      }

      if (gen === reconnectGenRef.current) {
        setPlaying(false)
        setReconnecting(false)
        setError('Strumień niedostępny.')
      }
    } finally {
      if (gen === reconnectGenRef.current) recoveringRef.current = false
    }
  }, [tryPlayUrl])

  const scheduleRecovery = useCallback(() => {
    if (localPlaybackRef.current) return

    clearRecoveryTimer()
    recoveryTimerRef.current = setTimeout(() => {
      recoveryTimerRef.current = null
      if (stoppedRef.current || userPausedRef.current || !currentRef.current) return
      if (localPlaybackRef.current) return

      const el = audioRef.current
      if (!el) return

      if (el.src && el.paused && !el.ended) {
        void el
          .play()
          .then(() => {
            setPlaying(true)
            setBuffering(false)
            setReconnecting(false)
            setError(null)
          })
          .catch(() => void reconnectStream())
        return
      }

      void reconnectStream()
    }, RECOVERY_DELAY_MS)
  }, [clearRecoveryTimer, reconnectStream])

  const playStation = useCallback(
    async (station: MusicStation) => {
      const el = audioRef.current
      if (!el) return

      cancelReconnect()
      clearLocalPlayback()
      stoppedRef.current = false
      userPausedRef.current = false
      startingRef.current = true
      setError(null)
      setCurrent(station)
      saveLastStation(station)
      el.pause()

      if (isLocalFilesStation(station)) {
        const ok = await startLocalPlaylist(station)
        startingRef.current = false
        if (!ok) setPlaying(false)
        return
      }

      const urls = streamUrlsForStation(station)
      for (let i = 0; i < urls.length; i++) {
        const ok = await tryPlayUrl(el, urls[i])
        if (ok) {
          setPlaying(true)
          startingRef.current = false
          return
        }
      }

      startingRef.current = false
      setPlaying(false)
      setError('Nie udało się odtworzyć stacji — spróbuj innej.')
    },
    [cancelReconnect, clearLocalPlayback, startLocalPlaylist, tryPlayUrl],
  )

  const pickLocalMusicFolder = useCallback(async () => {
    setError(null)
    const handle = await pickMusicRootFolder()
    if (!handle) {
      setError('Nie wybrano folderu lub brak uprawnień do odczytu.')
      return
    }
    rootHandleRef.current = handle
    setLocalMusic(await getLocalMusicStatus(handle))
  }, [])

  const togglePlay = useCallback(async () => {
    const el = audioRef.current
    if (!el) return

    if (playing) {
      cancelReconnect()
      userPausedRef.current = true
      el.pause()
      setPlaying(false)
      return
    }

    if (!current) return

    userPausedRef.current = false
    stoppedRef.current = false

    try {
      await el.play()
      setPlaying(true)
      setBuffering(false)
      setReconnecting(false)
      setError(null)
    } catch {
      setError('Kliknij ▶ jeszcze raz (wymagane działanie użytkownika).')
    }
  }, [playing, current, cancelReconnect])

  const stop = useCallback(() => {
    cancelReconnect()
    clearLocalPlayback()
    stoppedRef.current = true
    userPausedRef.current = false

    const el = audioRef.current
    if (el) {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
    setPlaying(false)
    setCurrent(null)
    setPlayerExpanded(false)
  }, [cancelReconnect, clearLocalPlayback])

  const clearError = useCallback(() => setError(null), [])

  const handleStreamIssue = useCallback(() => {
    if (startingRef.current || recoveringRef.current || stoppedRef.current || userPausedRef.current) return

    if (localPlaybackRef.current) {
      void playNextLocalTrack()
      return
    }

    clearRecoveryTimer()
    setBuffering(false)
    void reconnectStream()
  }, [clearRecoveryTimer, playNextLocalTrack, reconnectStream])

  const handleBuffering = useCallback(() => {
    if (localPlaybackRef.current) return
    if (startingRef.current || stoppedRef.current || userPausedRef.current || reconnecting) return
    setBuffering(true)
    scheduleRecovery()
  }, [reconnecting, scheduleRecovery])

  const handlePlaybackResumed = useCallback(() => {
    clearRecoveryTimer()
    setBuffering(false)
    setReconnecting(false)
    setPlaying(true)
    setError(null)
  }, [clearRecoveryTimer])

  const handleEnded = useCallback(() => {
    if (localPlaybackRef.current && !stoppedRef.current && !userPausedRef.current) {
      void playNextLocalTrack()
      return
    }
    setPlaying(false)
  }, [playNextLocalTrack])

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return

      const el = audioRef.current
      const station = currentRef.current
      if (!el || !station || stoppedRef.current || userPausedRef.current) return
      if (!el.paused) return

      if (localPlaybackRef.current) {
        void el.play().catch(() => {})
        return
      }

      if (el.src) {
        void el
          .play()
          .then(() => {
            setPlaying(true)
            setBuffering(false)
            setReconnecting(false)
            setError(null)
          })
          .catch(() => void reconnectStream())
      } else {
        void reconnectStream()
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [reconnectStream])

  useEffect(() => () => clearRecoveryTimer(), [clearRecoveryTimer])

  return (
    <MusicContext.Provider
      value={{
        current,
        playing,
        buffering,
        reconnecting,
        volume,
        error,
        playerExpanded,
        localMusic,
        setVolume,
        setPlayerExpanded,
        playStation,
        togglePlay,
        stop,
        clearError,
        pickLocalMusicFolder,
        refreshLocalMusic,
      }}
    >
      <audio
        ref={audioRef}
        preload="none"
        className="sr-only"
        aria-hidden
        onPlay={handlePlaybackResumed}
        onPlaying={handlePlaybackResumed}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onWaiting={handleBuffering}
        onStalled={handleBuffering}
        onError={handleStreamIssue}
      />
      {children}
    </MusicContext.Provider>
  )
}
