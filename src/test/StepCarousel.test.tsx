import { act, render, screen } from '@testing-library/react'
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

/**
 * Observador controlado: o stub global avisa na hora que o elemento "apareceu",
 * o que impede ver o estado anterior. Aqui o aviso fica guardado para o teste
 * dispara-lo quando quiser — e provar os dois lados da espera.
 */
function deferredObserver() {
  const original = globalThis.IntersectionObserver
  let notify: (() => void) | null = null

  class DeferredObserver {
    constructor(private readonly callback: IntersectionObserverCallback) {}

    observe(target: Element): void {
      const rect = target.getBoundingClientRect()

      notify = () =>
        this.callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 1,
              target,
              time: 0,
              boundingClientRect: rect,
              intersectionRect: rect,
              rootBounds: null,
            } as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver,
        )
    }

    unobserve(): void {}

    disconnect(): void {}

    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  globalThis.IntersectionObserver = DeferredObserver as unknown as typeof IntersectionObserver

  return {
    fire: () => notify?.(),
    restore: () => {
      globalThis.IntersectionObserver = original
    },
  }
}

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

  it('so manda baixar os videos quando o carrossel se aproxima', async () => {
    const observer = deferredObserver()

    try {
      const { container } = render(<StepCarousel items={[...ITEMS]} />)
      const firstVideo = () => container.querySelector('video')

      // Longe da dobra o navegador le so o cabecalho de cada arquivo.
      expect(firstVideo()).toHaveAttribute('preload', 'metadata')

      await act(async () => {
        observer.fire()
      })

      // Perto de aparecer, o download e liberado — o scrub ja vai achar o quadro.
      expect(firstVideo()).toHaveAttribute('preload', 'auto')
    } finally {
      observer.restore()
    }
  })
})
