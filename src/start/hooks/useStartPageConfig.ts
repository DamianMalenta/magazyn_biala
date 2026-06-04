import { useCallback, useEffect, useState } from 'react'
import { loadConfig, saveConfig, resetConfig, exportConfig, importConfig, resetAdminPin } from '../lib/storage'
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
      return loadConfig()
    })
  }, [])

  const doReset = useCallback(() => {
    const fresh = resetConfig()
    setConfig(fresh)
    return fresh
  }, [])

  const doResetAdminPin = useCallback(() => {
    const fixed = resetAdminPin()
    setConfig(fixed)
    return fixed
  }, [])

  const doExport = useCallback(() => exportConfig(config), [config])

  const doImport = useCallback(async (file: File) => {
    const result = await importConfig(file)
    if (result.ok) setConfig(result.config)
    return result
  }, [])

  return { config, update, reset: doReset, resetAdminPin: doResetAdminPin, exportBackup: doExport, importBackup: doImport, tick }
}
