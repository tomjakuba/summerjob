import { ToolName } from '../../prisma/client'
import { EnumMapping } from './enumMapping'

export const toolNameMapping: EnumMapping<keyof typeof ToolName> = {
  AXE: 'Sekera',
  BOW_SAW: 'Luková pila',
  LADDER: 'Žebřík',
  PAINT: 'Barva',
  PAINT_ROLLER: 'Váleček na barvu',
  COVER_SHEET: 'Zakrývací plachta',
  MASKING_TAPE: 'Malířská páska',
  PAINT_BRUSH: 'Malířská štětka',
  SCRAPER_GRID: 'Stírací mřížka',
  PAINTER_SPATULA: 'Malířská špachtle',
  JAPANESE_SPATULA: 'Japonská špachtle',
  GYPSUM: 'Sádra',
  BUCKET: 'Kbelík',
  RAG: 'Hadr',
  BROOM: 'Koště',
  SAW: 'Pila',
  BRUSHCUTTER: 'Křovinořez',
  GLOVES: 'Rukavice',
  RESPIRATOR: 'Respirátor',
  HEADPHONES: 'Sluchátka',
  CHAINSAW: 'Motorová pila',
  CIRCULAR_SAW: 'Kotoučová pila',
  RAKE: 'Hrabě',
  SHOVEL: 'Lopata',
  PITCHFORK: 'Vidle',
  HEDGE_TRIMMER: 'Plotostřih',
  STRING_TRIMMER: 'Strunová sekačka',
}
