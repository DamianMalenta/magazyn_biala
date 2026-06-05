import { describe, expect, it } from 'vitest'
import { findItemByName } from './itemMatch'
import type { InventoryItem } from '../../types/inventory'

const sample: InventoryItem[] = [
  { id: '1', name: 'Ser Mozzarella', category: 'LODÓWKA', unit: 'kg.', qty: 0 },
  { id: '2', name: 'Frytki', category: 'ZAMRAŻARKA', unit: 'kg.', qty: 2 },
]

describe('findItemByName', () => {
  it('matches ignoring case and accents', () => {
    expect(findItemByName(sample, 'ser mozzarella')?.id).toBe('1')
    expect(findItemByName(sample, 'SER MOZZARELLA')?.id).toBe('1')
  })

  it('returns undefined when not found', () => {
    expect(findItemByName(sample, 'Pomidory')).toBeUndefined()
  })
})
