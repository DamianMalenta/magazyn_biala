import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_INVENTORY } from '../data/defaultInventory'

const store = new Map<string, string>()

beforeEach(() => {
  store.clear()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  })
})

describe('inventoryStorage migration', () => {
  it('merges new default SKUs into saved inventory', async () => {
    const { loadState } = await import('./inventoryStorage')
    const legacy = DEFAULT_INVENTORY.filter(
      (item) => item.name !== 'Szynka' && item.name !== 'Zapiekanki',
    )
    store.set('magazyn_inventory_v4', JSON.stringify({ inventory: legacy, customAliases: {} }))

    const state = loadState()
    expect(state.inventory.some((item) => item.name === 'Szynka')).toBe(true)
    expect(state.inventory.some((item) => item.name === 'Zapiekanki')).toBe(true)
  })
})
