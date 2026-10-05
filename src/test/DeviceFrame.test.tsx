import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DeviceFrame } from '../components/ui/DeviceFrame'

/** Retorna a tela da moldura — o unico quadro que carrega a razao do video. */
const screenOf = (container: HTMLElement) => {
  const screen = container.querySelector('[data-screen]')
  if (!screen) throw new Error('a tela da moldura nao foi renderizada')
  return screen
}

describe('DeviceFrame', () => {
  it('desenha a tela do celular com a razao exata do video (574x1280)', () => {
    const { container } = render(
      <DeviceFrame device="phone">
        <video data-testid="filme" />
      </DeviceFrame>,
    )

    expect(container.querySelector('[data-device="phone"]')).not.toBeNull()
    expect(screenOf(container).className).toContain('aspect-[574/1280]')
    expect(container.querySelector('[data-testid="filme"]')).not.toBeNull()
  })

  it('desenha a tela do computador com a razao exata do video (1202x720)', () => {
    const { container } = render(
      <DeviceFrame device="desktop">
        <video data-testid="filme" />
      </DeviceFrame>,
    )

    expect(container.querySelector('[data-device="desktop"]')).not.toBeNull()
    expect(screenOf(container).className).toContain('aspect-[1202/720]')
    expect(container.querySelector('[data-testid="filme"]')).not.toBeNull()
  })

  it('esconde o chrome decorativo dos leitores de tela', () => {
    const { container } = render(
      <DeviceFrame device="desktop">
        <video />
      </DeviceFrame>,
    )

    const chrome = container.querySelectorAll('[data-device] span')

    expect(chrome.length).toBeGreaterThan(0)
    chrome.forEach((node) => expect(node.getAttribute('aria-hidden')).toBe('true'))
  })
})
