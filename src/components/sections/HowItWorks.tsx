import { useTranslation } from 'react-i18next'

import step1 from '../../assets/videos/Step_1.mp4'
import step2 from '../../assets/videos/Step_2.mp4'
import step3 from '../../assets/videos/Step_3.mp4'
import step4 from '../../assets/videos/Step_4.mp4'
import step5 from '../../assets/videos/Step_5.mp4'

import { Section } from '../ui/Section'
import { StepCarousel } from '../ui/StepCarousel'

/** Passos em ordem, com o video de demonstracao correspondente. */
const STEPS = [
  { id: 'montar', video: step1 },
  { id: 'fechar', video: step2 },
  { id: 'exportar', video: step3 },
  { id: 'importar', video: step4 },
  { id: 'automatizar', video: step5 },
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

  const items = STEPS.map(({ id, video }) => ({
    key: id,
    label: t(`howItWorks.steps.${id}.label`),
    title: t(`howItWorks.steps.${id}.title`),
    text: t(`howItWorks.steps.${id}.text`),
    video,
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
