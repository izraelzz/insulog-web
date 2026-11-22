import { describe, expect, it } from 'vitest'
import { getGlucoseLevel } from './glucoseLevel'

describe('getGlucoseLevel', () => {
  it.each([
    { glucose: 69, label: 'Baixo', tone: 'urgent' },
    { glucose: 70, label: 'No alvo', tone: 'good' },
    { glucose: 140, label: 'No alvo', tone: 'good' },
    { glucose: 141, label: 'Atenção', tone: 'warn' },
    { glucose: 180, label: 'Atenção', tone: 'warn' },
    { glucose: 181, label: 'Alto', tone: 'urgent' },
  ])('classifica $glucose mg/dL como $label', ({ glucose, label, tone }) => {
    expect(getGlucoseLevel(glucose)).toEqual({ label, tone })
  })
})
