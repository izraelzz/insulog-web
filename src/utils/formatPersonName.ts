const lowercaseNameParticles = new Set(['da', 'das', 'de', 'do', 'dos', 'e'])

function capitalizePart(value: string) {
  const [firstCharacter, ...remainingCharacters] = Array.from(value)
  return firstCharacter ? `${firstCharacter.toLocaleUpperCase('pt-BR')}${remainingCharacters.join('')}` : ''
}

export function formatPersonName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      const lowercaseWord = word.toLocaleLowerCase('pt-BR')
      if (index > 0 && lowercaseNameParticles.has(lowercaseWord)) return lowercaseWord

      return lowercaseWord.split(/([-’'])/).map((part, partIndex) => (
        partIndex % 2 === 0 ? capitalizePart(part) : part
      )).join('')
    })
    .join(' ')
}
