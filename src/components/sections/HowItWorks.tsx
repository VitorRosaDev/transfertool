import { useTranslation } from 'react-i18next'

import step1 from '../../assets/videos/Step_1.mp4'
import step2 from '../../assets/videos/Step_2.mp4'
import step3 from '../../assets/videos/Step_3.mp4'
import step4 from '../../assets/videos/Step_4.mp4'
import step5 from '../../assets/videos/Step_5.mp4'

import { Section } from '../ui/Section'
import { StepCarousel } from '../ui/StepCarousel'

/**
 * Passos em ordem, com o video de demonstracao correspondente e o aparelho que
 * ele retrata: os tres primeiros passos rodam no celular (retrato 574x1280) e os
 * dois ultimos, no computador (paisagem 1202x720) — o `device` escolhe a moldura
 * com a razao certa para cada um.
 */
const STEPS = [
  { id: 'montar', video: step1, device: 'phone' },
  { id: 'fechar', video: step2, device: 'phone' },
  { id: 'exportar', video: step3, device: 'phone' },
  { id: 'importar', video: step4, device: 'desktop' },
  { id: 'automatizar', video: step5, device: 'desktop' },
] as const

/**
 * Secao 02 — o fluxo em cinco passos, agora em carrossel horizontal.
 *
 * Cada passo vira um painel de tela cheia com um video de demonstracao que
 * avanca conforme o scroll: a secao gasta altura no eixo vertical e o trilho
 * desliza na horizontal, com o video "scrubbando" junto (reversivel no scroll).
 */
export function HowItWorks() {
  const { t } = useTranslation()

  const items = STEPS.map(({ id, video, device }) => ({
    key: id,
    label: t(`howItWorks.steps.${id}.label`),
    title: t(`howItWorks.steps.${id}.title`),
    text: t(`howItWorks.steps.${id}.text`),
    video,
    device,
  }))

  return (
    <Section
      id="howItWorks"
      number="02"
      eyebrow={t('howItWorks.eyebrow')}
      title={t('howItWorks.title')}
      subtitle={t('howItWorks.subtitle')}
      fullBleed
    >
      <StepCarousel items={items} />

      <div className="mx-auto mt-12 max-w-3xl border-t border-ink-200/80 px-6 pb-24 pt-6 text-center lg:mt-16 lg:pb-28">
        <p className="text-sm leading-relaxed text-ink-500">{t('howItWorks.humanNote')}</p>
      </div>
    </Section>
  )
}
