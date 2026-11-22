import { describe, expect, it } from 'vitest'
import { formatPersonName } from './formatPersonName'

describe('formatPersonName', () => {
  it.each([
    ['  MARIA   DA SILVA  ', 'Maria da Silva'],
    ["JOÃO E MARIA D'ÁVILA", "João e Maria D'Ávila"],
    ['ANA-MARIA DOS SANTOS', 'Ana-Maria dos Santos'],
    ['   ', ''],
  ])('formata %j como %j', (input, expected) => {
    expect(formatPersonName(input)).toBe(expected)
  })
})
