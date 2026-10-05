import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Navbar } from '../components/layout/Navbar'

/** Retangulo de teste (o jsdom nao calcula layout). */
function rect(top: number, bottom: number): DOMRect {
  return {
    top,
    bottom,
    height: bottom - top,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  } as DOMRect
}

/** Folha que cobre a linha do cabecalho, para orientar a pele da navbar. */
function mountSheet(tone: 'light' | 'dark', chrome: 'glass' | 'transparent' = 'glass') {
  const sheet = document.createElement('section')
  sheet.dataset.sectionTone = tone
  sheet.dataset.sectionChrome = chrome
  sheet.getBoundingClientRect = () => rect(-50, 500)
  document.body.append(sheet)

  return sheet
}

const header = () => document.querySelector('[data-site-header]') as HTMLElement

afterEach(() => {
  document.querySelectorAll('section[data-section-tone]').forEach((sheet) => sheet.remove())
})

describe('Navbar', () => {
  it('lista as folhas nomeadas da configuracao', () => {
    render(<Navbar />)

    const nav = screen.getByRole('navigation', { name: /navegação principal/i })

    expect(within(nav).getByRole('link', { name: 'Visão geral' })).toHaveAttribute(
      'href',
      '#overview',
    )
    expect(within(nav).getByRole('link', { name: 'Como funciona' })).toHaveAttribute(
      'href',
      '#howItWorks',
    )
    expect(within(nav).getByRole('link', { name: 'Privacidade' })).toHaveAttribute(
      'href',
      '#privacy',
    )
    expect(within(nav).queryByRole('link', { name: /contato/i })).not.toBeInTheDocument()
  })

  it('devolve a pagina ao topo quando o logo e clicado', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    render(<Navbar />)

    // O hero e a folha presa: rolar ate `#inicio` nao sai do lugar, entao o logo
    // assume a rolagem. O clique cancela a navegacao nativa para nao disputar o
    // alvo com o proprio `window.scrollTo`.
    await user.click(screen.getByRole('link', { name: /transfertool/i }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0 })
    expect(window.location.hash).toBe('')
  })

  it('usa icone generico no CTA mobile sem perder o nome acessivel', () => {
    render(<Navbar />)

    const downloadLink = screen.getByRole('link', { name: 'Baixar agora' })
    expect(downloadLink).toHaveAttribute('href', '#downloads')
    expect(downloadLink.querySelector('svg')).toHaveAttribute('stroke-width', '2.5')
    expect(downloadLink.querySelector('.sr-only')).toHaveTextContent('Baixar agora')
  })

  it('mantem o seletor fora da barra fixa e oferece o seletor dentro do menu', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const nav = screen.getByRole('navigation', { name: /navegação principal/i })
    expect(within(nav).queryByRole('group', { name: 'Idioma' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /abrir menu/i }))

    expect(
      within(document.getElementById('menu-mobile') as HTMLElement).getByRole('group', {
        name: 'Idioma',
      }),
    ).toBeInTheDocument()
  })

  it('abre solta sobre o hero, que e a primeira folha', () => {
    render(<Navbar />)

    expect(header().className).toContain('bg-transparent')
    expect(header().className).not.toContain('backdrop-blur-xl')
  })

  it('veste vidro branco sobre folha clara', async () => {
    render(<Navbar />)
    mountSheet('light')

    window.dispatchEvent(new Event('scroll'))

    await waitFor(() => expect(header().className).toContain('bg-white/85'))
    expect(header().className).toContain('backdrop-blur-xl')
  })

  it('veste o vidro da propria folha escura', async () => {
    render(<Navbar />)
    mountSheet('dark')

    window.dispatchEvent(new Event('scroll'))

    await waitFor(() => expect(header().className).toContain('bg-void-900/95'))
    expect(header().className).toContain('backdrop-blur-xl')
  })

  it('troca a pele num quadro, deixando a chegada para o blur', async () => {
    render(<Navbar />)

    // Nenhuma transicao de cor: animar tinta e vidro juntos punha os dois no
    // meio do caminho e derrubava o contraste para 2,3:1 na virada.
    expect(header().className).toContain('transition-[backdrop-filter]')
    expect(header().className).not.toContain('transition-colors')

    mountSheet('dark')
    window.dispatchEvent(new Event('scroll'))
    await waitFor(() => expect(header().className).toContain('bg-void-900/95'))

    expect(header().className).not.toContain('transition-colors')
  })

  it('volta a ficar solta quando a folha pede transparencia', async () => {
    render(<Navbar />)
    const sheet = mountSheet('dark')

    window.dispatchEvent(new Event('scroll'))
    await waitFor(() => expect(header().className).toContain('bg-void-900/95'))

    // A folha com cena de fundo devolve o cabecalho solto, como no hero.
    sheet.dataset.sectionChrome = 'transparent'
    window.dispatchEvent(new Event('scroll'))

    await waitFor(() => expect(header().className).toContain('bg-transparent'))
  })

  it('abre e fecha o menu mobile pelo teclado', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const toggle = screen.getByRole('button', { name: /abrir menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await user.click(toggle)

    expect(screen.getByRole('button', { name: /fechar menu/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(document.getElementById('menu-mobile')).not.toBeNull()

    await user.keyboard('{Escape}')

    await waitFor(() => expect(document.getElementById('menu-mobile')).toBeNull())
  })

  it('assume o vidro claro com o menu aberto, que abre um painel claro', async () => {
    const user = userEvent.setup()
    render(<Navbar />)
    mountSheet('dark')

    await user.click(screen.getByRole('button', { name: /abrir menu/i }))

    expect(header().className).toContain('bg-white/85')
  })
})
