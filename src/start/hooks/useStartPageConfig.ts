import { useCallback, useEffect, useState } from 'react'
import { loadConfig, saveConfig, resetConfig, exportConfig, importConfig } from '../lib/storage'
import type { StartPageConfig } from '../types'

export function useStartPageConfig() {
  const [config, setConfig] = useState<StartPageConfig>(() => loadConfig())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const update = useCallback((patch: StartPageConfig | ((prev: StartPageConfig) => StartPageConfig)) => {
    setConfig((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : patch
      saveConfig(next)
      return next
    })
  }, [])

  const doReset = useCallback(() => {
    const fresh = resetConfig()
    setConfig(fresh)
    return fresh
  }, [])

  const doExport = useCallback(() => exportConfig(config), [config])

  const doImport = useCallback(async (file: File) => {
    const result = await importConfig(file)
    if (result.ok) setConfig(result.config)
    return result
  }, [])

  return { config, update, reset: doReset, exportBackup: doExport, importBackup: doImport, tick }
}
