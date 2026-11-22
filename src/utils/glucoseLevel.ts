export type GlucoseTone = 'good' | 'warn' | 'urgent'

export function getGlucoseLevel(glucose: number): { label: string; tone: GlucoseTone } {
  if (glucose < 70) return { label: 'Baixo', tone: 'urgent' }
  if (glucose <= 140) return { label: 'No alvo', tone: 'good' }
  if (glucose <= 180) return { label: 'Atenção', tone: 'warn' }
  return { label: 'Alto', tone: 'urgent' }
}
