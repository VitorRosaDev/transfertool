import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { StepCarousel } from '../components/ui/StepCarousel'

/**
 * O `useReducedMotion` real responde pela media consultada no `matchMedia`, cujo
 * stub do setup devolve `false`. O mock deixa cada teste escolher a preferencia
 * e exercitar as duas ramificacoes (trilho preso ou carrossel de rolagem).
 */
const reducedMotion = vi.hoisted(() => ({ enabled: false }))

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()

  return { ...actual, useReducedMotion: () => reducedMotion.enabled }
})

/** Espelha os cinco passos da secao: tres no celular, dois no computador. */
const ITEMS = [
  { key: 'a', label: '01', title: 'Montar', text: 'texto a', video: 'a.mp4', device: 'phone' },
  { key: 'b', label: '02', title: 'Fechar', text: 'texto b', video: 'b.mp4', device: 'phone' },
  { key: 'c', label: '03', title: 'Exportar', text: 'texto c', video: 'c.mp4', device: 'phone' },
  { key: 'd', label: '04', title: 'Importar', text: 'texto d', video: 'd.mp4', device: 'desktop' },
  {
    key: 'e',
    label: '05',
    title: 'Automatizar',
    text: 'texto e',
    video: 'e.mp4',
    device: 'desktop',
  },
] as const

describe('StepCarousel', () => {
  beforeEach(() => {
    reducedMotion.enabled = false
  })

  it('desenha os cinco passos, cada um na moldura do seu aparelho', () => {
    const { container } = render(<StepCarousel items={[...ITEMS]} />)

    expect(container.querySelectorAll('video')).toHaveLength(5)
    expect(container.querySelectorAll('[data-device="phone"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-device="desktop"]')).toHaveLength(2)
  })

  it('poe o video antes do texto na composicao', () => {
    const { container } = render(<StepCarousel items={[...ITEMS]} />)

    const video = container.querySelector('video')
    const heading = container.querySelector('h3')

    if (!video || !heading) throw new Error('o painel nao foi renderizado')

    const position = video.compareDocumentPosition(heading)

    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('mantem as molduras e o texto estatico quando o movimento e reduzido', () => {
    reducedMotion.enabled = true

    const { container } = render(<StepCarousel items={[...ITEMS]} />)

    expect(container.querySelectorAll('[data-device]')).toHaveLength(5)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
    // Sem movimento o trilho nao e preso: vira um carrossel de rolagem.
    expect(container.querySelector('.sticky')).toBeNull()
  })
})
