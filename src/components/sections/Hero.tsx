import { lazy, Suspense } from 'react'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { sectionChrome, sectionIndex, sectionTone } from '../../config/sections'
import { trackEvent } from '../../lib/analytics'
import { heroSectionRef } from '../../lib/heroAnchor'
import { useTypewriter } from '../../lib/useTypewriter'
import { buttonClass } from '../ui/buttonClass'
import { ShapeGrid } from '../ui/ShapeGrid'
import { Stack } from '../ui/Stack'

/**
 * O nucleo 3D (`three` + React Three Fiber) responde por cerca de um terco do
 * JavaScript da pagina e e puramente decorativo: entra por import dinamico, em
 * chunk proprio, depois do primeiro quadro. O texto e o CTA do hero — o que o
 * visitante ve primeiro — nao esperam por ele.
 */
const TransferCoreCanvas = lazy(() =>
  import('./TransferCoreCanvas').then((module) => ({ default: module.TransferCoreCanvas })),
)

/**
 * Hero: a promessa em uma frase e o nucleo visual da transferencia.
 *
 * A folha e presa pelo `Stack` (o hero fica parado e a proxima folha sobe por
 * cima). O recuo do texto acompanha esse movimento: o progresso vem do scroll da
 * janela sobre o trecho em que a folha seguinte cobre a tela — se viesse do
 * retangulo do hero, ele ficaria em zero enquanto o hero estivesse preso.
 */
export function Hero() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const titleLine1 = t('hero.titleLine1')
  const titleLine2 = t('hero.titleLine2')
  const { typed, isTyping } = useTypewriter(titleLine2)

  // O recuo acompanha a folha seguinte: 0 quando ela aparece na base da janela,
  // 1 quando termina de cobrir o hero. Vem do retangulo real (e nao de uma
  // medida guardada), entao continua exato com qualquer altura de janela, fonte
  // ou conteudo — sem estado para sair de sincronia.
  const { scrollY } = useScroll()

  const copyProgress = useTransform(scrollY, () => {
    const nextSheet = heroSectionRef.current?.nextElementSibling
    if (!nextSheet) return 0

    const viewport = window.innerHeight
    const covered = viewport - nextSheet.getBoundingClientRect().top

    return Math.min(1, Math.max(0, covered / viewport))
  })

  const copyY = useTransform(copyProgress, [0, 1], [0, shouldReduceMotion ? 0 : -60])
  const copyOpacity = useTransform(copyProgress, [0, 0.72], [1, shouldReduceMotion ? 1 : 0])

  return (
    <Stack
      id="inicio"
      tone={sectionTone('inicio')}
      chrome={sectionChrome('inicio')}
      index={sectionIndex('inicio')}
      ref={heroSectionRef}
      className="overflow-hidden bg-void-950 pt-28 pb-20 text-white sm:pt-32 lg:pt-40 lg:pb-28"
      background={
        /*
          Palco do hero: malha animada no lugar da textura estatica. O passo de
          100px mantem a cadencia da malha antiga; a borda usa o mesmo branco de
          5,5% e o hover acende a celula no azul da marca. A camada nao captura
          ponteiro (o ShapeGrid rastreia o cursor pela janela) e desbota nas
          bordas pela mascara radial.
        */
        <div className="h-full w-full mask-fade-edges">
          <ShapeGrid
            direction="diagonal"
            speed={0.2}
            squareSize={100}
            shape="square"
            borderColor="rgba(255, 255, 255, 0.055)"
            hoverFillColor="rgba(59, 118, 246, 0.22)"
            hoverTrailAmount={4}
          />
        </div>
      }
    >
      <div className="relative mx-auto my-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
          {/*
            No mobile a coluna unica abre pelo cubo e o titulo vem logo depois,
            seguido do resto do texto. A partir de lg o `order` sai de cena (o
            bloco volta a ser `block`) e vale a ordem do documento: texto a
            esquerda, cubo a direita.
          */}
          <motion.div
            style={{ y: copyY, opacity: copyOpacity }}
            className="order-2 flex flex-col items-center text-center lg:order-1 lg:block lg:text-left"
          >
            <p className="mono-label order-2 mt-4 text-center text-white/55 lg:order-0 lg:mt-0 lg:text-left">
              {t('hero.badge')}
            </p>

            {/*
              Duas camadas no mesmo slot do grid: a invisivel reserva a altura do
              titulo completo (nada se desloca enquanto o texto e datilografado) e
              a visivel mostra o prefixo. O nome acessivel vem do aria-label.
              A quebra forcada mantem a segunda linha sempre abaixo da primeira:
              sem ela o texto datilografado comeca na mesma linha e a frase reflui
              a cada letra.
            */}
            <h1
              aria-label={`${titleLine1} ${titleLine2}`}
              className="order-1 mt-0 grid max-w-[18ch] text-left text-4xl leading-[1.06] font-bold text-balance text-white sm:text-5xl lg:order-0 lg:mt-6 lg:text-[3.4rem]"
            >
              <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                {titleLine1}
                <br />
                <span className="text-white/50">{titleLine2}</span>
              </span>

              <span aria-hidden="true" className="col-start-1 row-start-1">
                {titleLine1}
                <br />
                <span className="text-white/50">{typed}</span>
                {isTyping ? (
                  <span className="ml-1 inline-block h-[1em] w-[0.085em] translate-y-[0.08em] rounded-full bg-current animate-caret-blink" />
                ) : null}
              </span>
            </h1>

            <p className="order-3 mx-auto mt-7 max-w-xl text-justify text-base leading-relaxed text-white/70 sm:text-lg lg:mx-0 lg:text-left">
              {t('hero.subtitle')}
            </p>

            <div className="order-4 mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href="#downloads"
                className={buttonClass('primary', 'lg')}
                onClick={() => trackEvent('cta_click', { location: 'hero', target: 'downloads' })}
              >
                {t('hero.ctaPrimary')}
              </a>
              <a
                href="#howItWorks"
                className={buttonClass('onDark', 'lg')}
                onClick={() =>
                  trackEvent('cta_click', { location: 'hero', target: 'how-it-works' })
                }
              >
                {t('hero.ctaSecondary')}
              </a>
            </div>

            <p className="order-5 mono-label mt-8 flex items-center justify-center gap-2.5 text-center text-white/65 lg:justify-start lg:text-left">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400 animate-pulse-soft"
              />
              {t('hero.offlineNote')}
            </p>
          </motion.div>

          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2">
            <div className="relative h-60 w-full sm:h-90 lg:h-100">
              {/* A caixa ja reserva a altura do cubo: o fallback vazio nao
                  desloca nada enquanto o chunk do 3D carrega. */}
              <Suspense fallback={null}>
                <TransferCoreCanvas className="absolute inset-0 h-full w-full" />
              </Suspense>
            </div>

            <motion.p
              style={{ opacity: copyOpacity }}
              className="mono-label mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center text-white/50"
            >
              <span>{t('hero.flow.mobileLabel')}</span>
              <span aria-hidden="true" className="text-white/20">
                &rarr;
              </span>
              <span>{t('hero.flow.desktopLabel')}</span>
            </motion.p>
          </div>
        </div>
      </div>
    </Stack>
  )
}
