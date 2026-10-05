import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import logoUrl from '../../assets/icon.svg'
import { NAV_SECTIONS, type SectionChrome, type SectionTone } from '../../config/sections'
import { useSectionTheme } from '../../lib/useSectionTheme'
import { buttonClass } from '../ui/buttonClass'
import { IconClose, IconDownload, IconMenu } from '../ui/icons'
import { LanguageToggle } from './LanguageToggle'

/** Pele do cabecalho: solta sobre a cena do hero, vidro do tom nas outras folhas. */
type NavbarSkin = 'transparent' | 'light' | 'dark'

/**
 * Pele do cabecalho: solta sobre a cena do hero, vidro do tom nas outras folhas.
 *
 * O vidro usa a propria cor da folha: branco (`bg-surface`) na folha clara e
 * `void-900` na folha escura, que e exatamente a superficie declarada em
 * `SHEET_SURFACE.dark`. Assim a barra le como parte da secao — o vidro vem do
 * blur e do filete, nao de um tom proprio.
 *
 * O alpha e assimetrico de proposito: o branco pode ser mais transparente
 * (deixa a folha escura aparecer por tras e foi o que ficou bom), mas o escuro
 * precisa fechar a cor enquanto a faixa do cabecalho ainda esta sobre a folha
 * clara — a 85% o branco vaza e a barra le como cinza (48,50,53) ate a folha
 * escura chegar.
 */
const SKIN_CLASS: Record<
  NavbarSkin,
  { chrome: string; brand: string; link: string; control: string }
> = {
  transparent: {
    chrome: 'border-transparent bg-transparent backdrop-blur-0',
    brand: 'text-white',
    link: 'text-white/80',
    control: 'border-white/25 text-white hover:bg-white/10',
  },
  light: {
    chrome: 'border-ink-200/70 bg-white/85 backdrop-blur-xl',
    brand: 'text-ink-900',
    link: 'text-ink-600',
    control: 'border-ink-200 text-ink-700 hover:bg-ink-100',
  },
  dark: {
    chrome: 'border-white/10 bg-void-900/95 backdrop-blur-xl',
    brand: 'text-white',
    link: 'text-white/80',
    control: 'border-white/25 text-white hover:bg-white/10',
  },
}

/**
 * Vidro na cor da folha; solto apenas onde a folha tem cena de fundo.
 *
 * O menu aberto e um painel claro, entao o cabecalho acompanha o claro enquanto
 * ele estiver aberto.
 */
function navbarSkin(tone: SectionTone, chrome: SectionChrome, menuOpen: boolean): NavbarSkin {
  if (menuOpen) return 'light'

  return chrome === 'transparent' ? 'transparent' : tone
}

/**
 * Cabecalho fixo.
 *
 * A pele acompanha a folha que atravessa a linha do cabecalho
 * (`useSectionTheme`): vidro branco translucido sobre folha clara, vidro na cor
 * da folha escura (`void-900`) sobre folha escura — e solto sobre o hero, onde a
 * malha aparece por tras.
 *
 * A troca e seca de proposito: tinta e vidro mudam no mesmo quadro, e quem faz
 * a chegada e o `backdrop-filter`. Animar as cores punha barra e tinta no meio
 * do caminho ao mesmo tempo — medido, o contraste caia a 2,3:1 por ~100ms, que e
 * o que se lia como "piscada" ao entrar numa secao escura. O blur nao interfere
 * na leitura, entao ele pode continuar animando.
 *
 * `data-site-nav` publica a altura real do cabecalho para essa leitura.
 */
export function Navbar() {
  const { i18n, t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { tone, chrome } = useSectionTheme()
  const skin = SKIN_CLASS[navbarSkin(tone, chrome, menuOpen)]

  useEffect(() => {
    // Fecha o menu mobile sempre que o idioma muda (evento de sistema externo).
    const handleLanguageChanged = () => setMenuOpen(false)
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  return (
    <header
      data-site-header=""
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[backdrop-filter] duration-300 ease-out ${skin.chrome}`}
    >
      <nav
        data-site-nav=""
        aria-label={t('nav.ariaLabel')}
        className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-6 sm:px-8 lg:h-18"
      >
        <a
          href="#inicio"
          className="flex items-center gap-2.5"
          onClick={(event) => {
            // O hero e a primeira folha presa (`position: sticky`), entao quando a
            // pagina esta rolada ele ja aparece no topo da janela: a rolagem nativa
            // ate `#inicio` conclui "alvo visivel" e nao sai do lugar. O logo
            // devolve a pagina ao topo na mao — o `scroll-behavior` do CSS cuida do
            // suave (e do `auto` sob movimento reduzido).
            event.preventDefault()
            setMenuOpen(false)
            window.scrollTo({ top: 0 })
          }}
        >
          <img src={logoUrl} alt="Início" width={40} height={42} className="h-9 w-auto" />
          <span className={`font-display text-lg font-bold tracking-tight ${skin.brand}`}>
            {t('common.brand')}
          </span>
        </a>

        <ul className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-[background-color] hover:bg-brand-50 hover:text-brand-700 ${skin.link}`}
              >
                {t(section.navLabelKey)}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2.5">
          <a
            href="#downloads"
            className={buttonClass('primary', 'md', 'max-lg:w-11 max-lg:px-0')}
            onClick={() => setMenuOpen(false)}
            title={t('nav.cta')}
          >
            <span className="sr-only lg:not-sr-only">{t('nav.cta')}</span>
            <IconDownload className="h-5 w-5" strokeWidth={2.5} />
          </a>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-[background-color] lg:hidden ${skin.control}`}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? t('common.closeMenu') : t('common.openMenu')}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {menuOpen ? (
          <motion.div
            id="menu-mobile"
            key="menu-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ink-200/70 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4 sm:px-8">
              {NAV_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-xl px-3 py-2.5 text-base font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t(section.navLabelKey)}
                  </a>
                </li>
              ))}
              <li className="pt-1 sm:hidden">
                <a
                  href="#downloads"
                  className={buttonClass('primary', 'md', 'w-full')}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('nav.cta')}
                </a>
              </li>
              <li className="flex justify-center border-t border-ink-200/70 pt-3">
                <LanguageToggle />
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
