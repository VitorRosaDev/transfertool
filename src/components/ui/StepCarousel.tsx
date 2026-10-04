import { useRef } from 'react'
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'

interface StepItem {
  key: string
  label: string
  title: string
  text: string
  video: string
}

interface StepCarouselProps {
  items: StepItem[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Carrossel horizontal dirigido por scroll, em tela cheia.
 *
 * Uma secao alta (`h-[500vh]`) "gasta" o scroll vertical; dentro dela um
 * viewport `sticky top-0` prende na tela e o trilho desliza em `x`. Cada video
 * e "scrubbado" pelo mesmo progresso da mola que move o trilho, entao deslize e
 * video ficam em sincronia (e reversiveis no scroll).
 */
export function StepCarousel({ items }: StepCarouselProps) {
  const shouldReduceMotion = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  })

  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.5 })

  const count = items.length
  const x = useTransform(progress, [0, 1], ['0vw', `${-(count - 1) * 100}vw`])

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
                progress={progress}
                scrubEnabled={false}
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
              <StepPanel item={item} index={index} count={count} progress={progress} scrubEnabled />
            </li>
          ))}
        </motion.ul>

        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-500"
          style={{ scaleX: progress }}
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
}

function StepPanel({ item, index, count, progress, scrubEnabled }: StepPanelProps) {
  return (
    <div className="flex h-full w-full items-center justify-center px-6 py-16 sm:px-12 lg:px-20">
      <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mono-label text-ink-500">{item.label}</p>
          <h3 className="mt-4 text-2xl font-bold text-balance text-ink-900 sm:text-4xl">
            {item.title}
          </h3>
          <p className="mt-4 max-w-xl text-justify text-base leading-relaxed text-ink-600 sm:text-lg">
            {item.text}
          </p>
        </div>

        <StepVideo
          src={item.video}
          index={index}
          count={count}
          progress={progress}
          enabled={scrubEnabled}
        />
      </div>
    </div>
  )
}

interface StepVideoProps {
  src: string
  index: number
  count: number
  progress: MotionValue<number>
  enabled: boolean
}

function StepVideo({ src, index, count, progress, enabled }: StepVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const durationRef = useRef(0)

  useMotionValueEvent(progress, 'change', (value) => {
    if (!enabled) return
    const video = videoRef.current
    if (!video || durationRef.current <= 0 || video.readyState < 1) return

    const scrub = clamp((count - 1) * value - index + 1, 0, 1)
    const next = scrub * durationRef.current
    if (Math.abs(video.currentTime - next) > 0.03) {
      video.currentTime = next
    }
  })

  return (
    <div className="flex justify-center">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={(event) => {
          durationRef.current = event.currentTarget.duration
        }}
        className="max-h-[70vh] w-full max-w-xl rounded-xl border border-ink-200/70 bg-surface-muted object-contain shadow-lift"
      />
    </div>
  )
}
