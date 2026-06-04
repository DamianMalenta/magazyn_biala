import { describe, expect, it } from 'vitest'
import { normalizeUom } from './uomNormalizer'

describe('normalizeUom', () => {
  it.each([
    ['x', 'szt.'],
    ['szt', 'szt.'],
    ['kg', 'kg.'],
    ['op', 'opak.'],
    ['opakowań', 'opak.'],
    ['worek', 'opak.'],
    ['pojemnik', 'opak.'],
    ['paczka', 'opak.'],
    [undefined, 'szt.'],
  ] as const)('maps %s to %s', (input, expected) => {
    expect(normalizeUom(input)).toBe(expected)
  })
})
