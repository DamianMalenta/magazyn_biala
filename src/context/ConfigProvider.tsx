import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { AppConfig, CategoryConfig } from '../types/config'
import type { StandardUOM } from '../types/inventory'
import { ConfigContext, type ConfigContextValue } from './configContext'
import {
  buildParserConfig,
  createCategoryId,
  getCategoryNames,
  DEFAULT_APP_CONFIG,
} from '../lib/data/defaultConfig'
import {
  loadConfig,
  saveConfig,
  resetConfig as resetStoredConfig,
  exportConfigJson,
  importConfigJson,
} from '../lib/storage/configStorage'

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<AppConfig>(() => loadConfig())

  const persist = useCallback((next: AppConfig) => {
    setConfigState(next)
    saveConfig(next)
  }, [])

  const updateConfig = useCallback(
    (updater: (prev: AppConfig) => AppConfig) => {
      persist(updater(structuredClone(config)))
    },
    [config, persist],
  )

  const resetConfig = useCallback(() => {
    persist(resetStoredConfig())
  }, [persist])

  const importConfig = useCallback(
    (json: string) => {
      persist(importConfigJson(json))
    },
    [persist],
  )

  const exportConfig = useCallback(() => exportConfigJson(config), [config])

  const addCategory = useCallback(
    (payload: Omit<CategoryConfig, 'id'>) => {
      updateConfig((prev) => ({
        ...prev,
        categories: [...prev.categories, { ...payload, id: createCategoryId() }],
      }))
    },
    [updateConfig],
  )

  const updateCategory = useCallback(
    (id: string, patch: Partial<CategoryConfig>) => {
      updateConfig((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }))
    },
    [updateConfig],
  )

  const removeCategory = useCallback(
    (id: string) => {
      if (config.categories.length <= 1) return false
      updateConfig((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
      }))
      return true
    },
    [config.categories.length, updateConfig],
  )

  const setSkuAliases = useCallback(
    (skuName: string, aliases: string[]) => {
      updateConfig((prev) => ({
        ...prev,
        skuAliases: { ...prev.skuAliases, [skuName]: aliases },
      }))
    },
    [updateConfig],
  )

  const renameSkuAliases = useCallback(
    (oldName: string, newName: string) => {
      updateConfig((prev) => {
        const next = { ...prev.skuAliases }
        if (next[oldName]) {
          next[newName] = next[oldName]
          delete next[oldName]
        }
        return { ...prev, skuAliases: next }
      })
    },
    [updateConfig],
  )

  const removeSkuAliases = useCallback(
    (skuName: string) => {
      updateConfig((prev) => {
        const next = { ...prev.skuAliases }
        delete next[skuName]
        return { ...prev, skuAliases: next }
      })
    },
    [updateConfig],
  )

  const addAliasToSku = useCallback(
    (skuName: string, alias: string) => {
      const trimmed = alias.trim()
      if (!trimmed) return
      updateConfig((prev) => {
        const existing = prev.skuAliases[skuName] ?? []
        if (existing.includes(trimmed)) return prev
        return {
          ...prev,
          skuAliases: { ...prev.skuAliases, [skuName]: [...existing, trimmed] },
        }
      })
    },
    [updateConfig],
  )

  const removeAliasFromSku = useCallback(
    (skuName: string, alias: string) => {
      updateConfig((prev) => ({
        ...prev,
        skuAliases: {
          ...prev.skuAliases,
          [skuName]: (prev.skuAliases[skuName] ?? []).filter((a) => a !== alias),
        },
      }))
    },
    [updateConfig],
  )

  const setIgnoreKeywords = useCallback(
    (keywords: string[]) => {
      updateConfig((prev) => ({ ...prev, ignoreLineKeywords: keywords }))
    },
    [updateConfig],
  )

  const addIgnoreKeyword = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim().toLowerCase()
      if (!trimmed) return
      updateConfig((prev) => ({
        ...prev,
        ignoreLineKeywords: prev.ignoreLineKeywords.includes(trimmed)
          ? prev.ignoreLineKeywords
          : [...prev.ignoreLineKeywords, trimmed],
      }))
    },
    [updateConfig],
  )

  const removeIgnoreKeyword = useCallback(
    (keyword: string) => {
      updateConfig((prev) => ({
        ...prev,
        ignoreLineKeywords: prev.ignoreLineKeywords.filter((k) => k !== keyword),
      }))
    },
    [updateConfig],
  )

  const setUomMapping = useCallback(
    (raw: string, standard: StandardUOM) => {
      const key = raw.trim().toLowerCase()
      if (!key) return
      updateConfig((prev) => ({
        ...prev,
        uomMappings: { ...prev.uomMappings, [key]: standard },
      }))
    },
    [updateConfig],
  )

  const removeUomMapping = useCallback(
    (raw: string) => {
      updateConfig((prev) => {
        const next = { ...prev.uomMappings }
        delete next[raw]
        return { ...prev, uomMappings: next }
      })
    },
    [updateConfig],
  )

  const setRawUnitTokens = useCallback(
    (tokens: string[]) => {
      updateConfig((prev) => ({ ...prev, rawUnitTokens: tokens }))
    },
    [updateConfig],
  )

  const addRawUnitToken = useCallback(
    (token: string) => {
      const trimmed = token.trim().toLowerCase()
      if (!trimmed) return
      updateConfig((prev) => ({
        ...prev,
        rawUnitTokens: prev.rawUnitTokens.includes(trimmed)
          ? prev.rawUnitTokens
          : [...prev.rawUnitTokens, trimmed],
      }))
    },
    [updateConfig],
  )

  const removeRawUnitToken = useCallback(
    (token: string) => {
      updateConfig((prev) => ({
        ...prev,
        rawUnitTokens: prev.rawUnitTokens.filter((t) => t !== token),
      }))
    },
    [updateConfig],
  )

  const setUnitAsProductName = useCallback(
    (tokens: string[]) => {
      updateConfig((prev) => ({ ...prev, unitAsProductName: tokens }))
    },
    [updateConfig],
  )

  const setFuzzyMatch = useCallback(
    (enabled: boolean, maxDistance?: number) => {
      updateConfig((prev) => ({
        ...prev,
        fuzzyMatchEnabled: enabled,
        fuzzyMatchMaxDistance: maxDistance ?? prev.fuzzyMatchMaxDistance,
      }))
    },
    [updateConfig],
  )

  const parserConfig = useMemo(() => buildParserConfig(config), [config])
  const categoryNames = useMemo(() => getCategoryNames(config), [config])

  const value = useMemo<ConfigContextValue>(
    () => ({
      config,
      parserConfig,
      categoryNames,
      updateConfig,
      resetConfig,
      importConfig,
      exportConfig,
      addCategory,
      updateCategory,
      removeCategory,
      setSkuAliases,
      renameSkuAliases,
      removeSkuAliases,
      addAliasToSku,
      removeAliasFromSku,
      setIgnoreKeywords,
      addIgnoreKeyword,
      removeIgnoreKeyword,
      setUomMapping,
      removeUomMapping,
      setRawUnitTokens,
      addRawUnitToken,
      removeRawUnitToken,
      setUnitAsProductName,
      setFuzzyMatch,
    }),
    [
      config,
      parserConfig,
      categoryNames,
      updateConfig,
      resetConfig,
      importConfig,
      exportConfig,
      addCategory,
      updateCategory,
      removeCategory,
      setSkuAliases,
      renameSkuAliases,
      removeSkuAliases,
      addAliasToSku,
      removeAliasFromSku,
      setIgnoreKeywords,
      addIgnoreKeyword,
      removeIgnoreKeyword,
      setUomMapping,
      removeUomMapping,
      setRawUnitTokens,
      addRawUnitToken,
      removeRawUnitToken,
      setUnitAsProductName,
      setFuzzyMatch,
    ],
  )

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export { DEFAULT_APP_CONFIG }
