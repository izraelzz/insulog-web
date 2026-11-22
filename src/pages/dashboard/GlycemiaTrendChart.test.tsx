// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { PatientGlucoseRecord } from '../../services/patientService'
import GlycemiaTrendChart from './GlycemiaTrendChart'

afterEach(cleanup)

const records: PatientGlucoseRecord[] = [
  {
    id_registro: 1,
    id_usuario: 5,
    nivel_glicose: 118,
    data_hora: '2026-11-22 08:00:00',
    periodo: 'Jejum',
    insulina: null,
  },
  {
    id_registro: 2,
    id_usuario: 5,
    nivel_glicose: 167,
    data_hora: '2026-11-22 10:00:00',
    periodo: 'Após refeição',
    insulina: null,
  },
]

describe('GlycemiaTrendChart', () => {
  it('mostra o valor do ponto clicado e o esconde ao clicar novamente', () => {
    render(<GlycemiaTrendChart records={records} />)
    const point = screen.getByRole('button', { name: 'Glicose 167 mg/dL' })

    fireEvent.click(point)
    expect(screen.getByRole('status').textContent).toBe('167 mg/dL')
    expect(point.getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(point)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('fecha o valor selecionado ao pressionar Escape', () => {
    render(<GlycemiaTrendChart records={records} />)
    const point = screen.getByRole('button', { name: 'Glicose 167 mg/dL' })

    fireEvent.click(point)
    fireEvent.keyDown(point, { key: 'Escape' })

    expect(screen.queryByRole('status')).toBeNull()
    expect(point.getAttribute('aria-pressed')).toBe('false')
  })
})
