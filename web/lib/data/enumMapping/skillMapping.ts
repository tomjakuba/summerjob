import { Skill } from '../../prisma/client'
import { EnumMapping } from './enumMapping'

export const skillMapping: EnumMapping<keyof typeof Skill> = {
  LUMBERJACK: 'Motorová pila',
  ARTIST: 'Malování',
  GARDENER: 'Křovinořez / Plotořez',
  DANGER: 'Cirkulárka+fréza',
  ELECTRICIAN: 'Elektrikář',
  HEIGHTS: 'Práce ve výškách',
  MASON: 'Zedník',
}
