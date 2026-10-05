import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'

import { stepScroll } from '../../lib/stepScroll'
import { DeviceFrame, type DeviceKind } from './DeviceFrame'

/**
 * Mola do scrub de cada video.
 *
 * O trilho anda no progresso cru — as quinas entre scrub e slide continuam secas
 * —, mas o video passa por esta mola antes de virar `currentTime`: assim ele
 * desliza atras do scroll, sem pular de keyframe em keyframe a cada evento. Um
 * pouco mais firme que a mola antiga (que amaciava o trilho inteiro) porque aqui
 * o atraso aparece como o video "chegando depois" do dedo.
 */
const VIDEO_SPRING = { stiffness: 170, damping: 28, mass: 0.6 }

interface StepItem {
  key: string
  label: string
  title: string
  text: string
  video: string
  device: DeviceKind
}

interface StepCarouselProps {
  items: StepItem[]
}

/**
 * Carrossel de passos dirigido por scroll, em tela cheia.
 *
 * A secao gasta altura no eixo vertical (`h-[500vh]`); dentro dela um viewport
 * `sticky top-0` prende na tela e o trilho anda na horizontal. O progresso do
 * scroll **nao** move o trilho de forma continua: ele alterna fases (ver
 * `src/lib/stepScroll.ts`). Durante o **scrub** a tela fica travada no passo e o
 * video roda com o texto surgindo; durante o **slide** o trilho anda para o
 * passo seguinte. As fases se encontram em quina — sem mola —, entao a troca de
 * eixo e seca, sem a "curva" que o easing desenhava nas pontas.
 */
export function StepCarousel({ items }: StepCarouselProps) {
  const shouldReduceMotion = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [armed, setArmed] = useState(false)
  const count = items.length

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  /*
    Os cinco videos somam quase 4 MB e ficam muito abaixo da dobra: com
    `preload="auto"` eles baixavam por inteiro no carregamento da pagina. Ate o
    carrossel se aproximar, o navegador le so o cabecalho de cada arquivo
    (`metadata`); quando a secao chega a uma tela de distancia, o sinal libera o
    download — a tempo de o scrub encontrar o quadro pronto. O observador para no
    primeiro aviso: a decisao e definitiva e nao ha o que remeber.
  */
  useEffect(() => {
    const node = wrapperRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setArmed(true)
      },
      { rootMargin: '100% 0px' },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const x = useTransform(scrollYProgress, (progress) => `${stepScroll(progress, count).xVw}vw`)

  if (shouldReduceMotion) {
    return (
      <div ref={wrapperRef} className="overflow-x-auto">
        <ul className="flex snap-x snap-mandatory">
          {items.map((item, index) => (
            <li key={item.key} className="h-screen w-screen shrink-0 snap-center">
              <StepPanel
                item={item}
                index={index}
                count={count}
                progress={scrollYProgress}
                scrubEnabled={false}
                armed={armed}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className="relative h-[500vh] shrink-0">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.ul className="flex h-full" style={{ x }}>
          {items.map((item, index) => (
            <li key={item.key} className="h-full w-screen shrink-0">
              <StepPanel
                item={item}
                index={index}
                count={count}
                progress={scrollYProgress}
                scrubEnabled
                armed={armed}
              />
            </li>
          ))}
        </motion.ul>

        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-500"
          style={{ scaleX: scrollYProgress }}
        />
      </div>
    </div>
  )
}

interface StepPanelProps {
  item: StepItem
  index: number
  count: number
  progress: MotionValue<number>
  scrubEnabled: boolean
  armed: boolean
}

function StepPanel({ item, index, count, progress, scrubEnabled, armed }: StepPanelProps) {
  // Progresso do proprio passo: o video so anda depois que ele preenche a tela.
  const rawScrub = useTransform(progress, (value) => stepScroll(value, count).scrub[index])
  // O video le a versao amaciada; o trilho (`x`) e o texto (`reveal`) seguem no
  // progresso cru, para a troca de passo nao ganhar curva.
  const scrub = useSpring(rawScrub, VIDEO_SPRING)
  // Presenca do texto: sobe junto com o scrub e cai no slide de saida.
  const reveal = useTransform(progress, (value) => stepScroll(value, count).reveal[index])
  const textOpacity = useTransform(reveal, [0, 0.4], [0, 1])
  const textY = useTransform(reveal, [0, 0.4], [18, 0])

  return (
    <div className="flex h-full w-full items-center justify-center px-6 py-10 sm:px-12 sm:py-14 lg:px-20">
      <div className="grid w-full max-w-6xl items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
        <StepVideo
          device={item.device}
          src={item.video}
          scrub={scrub}
          enabled={scrubEnabled}
          armed={armed}
        />

        <motion.div style={scrubEnabled ? { opacity: textOpacity, y: textY } : undefined}>
          <p className="mono-label text-ink-500">{item.label}</p>
          <h3 className="mt-4 text-2xl font-bold text-balance text-ink-900 sm:text-4xl">
            {item.title}
          </h3>
          <p className="mt-4 max-w-xl text-justify text-base leading-relaxed text-ink-600 sm:text-lg">
            {item.text}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

interface StepVideoProps {
  src: string
  device: DeviceKind
  /** Progresso do video do proprio passo (0 parado, 1 no ultimo frame). */
  scrub: MotionValue<number>
  enabled: boolean
  /** O carrossel ja se aproximou da janela: o arquivo pode ser baixado por inteiro. */
  armed: boolean
}

function StepVideo({ src, device, scrub, enabled, armed }: StepVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const durationRef = useRef(0)
  /** Ultimo alvo do scrub (0..1) — a fonte da proxima escrita de `currentTime`. */
  const targetRef = useRef(0)
  /** Handle do quadro ja agendado; `0` quando nao ha seek esperando. */
  const frameRef = useRef(0)

  /*
    Trocar o atributo `preload` depois da montagem nao obriga o navegador a
    refazer a selecao de recurso; o `load()` forca. So roda uma vez, quando o
    carrossel se aproxima — antes disso o quadro nem chegou a ser buscado.
  */
  useEffect(() => {
    const video = videoRef.current
    if (!video || !armed) return

    video.preload = 'auto'
    video.load()
  }, [armed])

  /*
    O `scrub` chega amaciado por uma mola (ver `StepPanel`). Em vez de escrever o
    `currentTime` a cada evento — o que fazia o encoder pular de keyframe em
    keyframe —, o alvo so fica guardado e a escrita sai **uma por quadro**, no
    `requestAnimationFrame`. Enquanto um seek ainda corre (`seeking`) a escrita
    espera: disparar em cima do anterior faz o navegador cancelar o seek pela
    metade e apresentar pouquissimos quadros na tela. Eventos que chegam durante a
    espera nao se acumulam — so trocam o alvo.
  */
  useMotionValueEvent(scrub, 'change', (value) => {
    if (!enabled) return
    targetRef.current = value
    if (frameRef.current) return

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0

      const video = videoRef.current
      if (!video || durationRef.current <= 0 || video.readyState < 1) return

      const next = targetRef.current * durationRef.current
      if (!video.seeking && Math.abs(video.currentTime - next) > 0.001) {
        video.currentTime = next
      }
    })
  })

  // Um quadro agendado nao pode escrever no video depois de o componente sair.
  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  return (
    <div className="flex justify-center">
      <DeviceFrame device={device}>
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload={armed ? 'auto' : 'metadata'}
          aria-hidden="true"
          onLoadedMetadata={(event) => {
            const video = event.currentTarget
            durationRef.current = video.duration
            // A mola pode ter andado antes de a duracao chegar; sem esta escrita o
            // video ficaria no primeiro quadro ate o proximo evento de scroll.
            if (enabled && durationRef.current > 0) {
              video.currentTime = targetRef.current * durationRef.current
            }
          }}
          className="h-full w-full object-cover"
        />
      </DeviceFrame>
    </div>
  )
}
