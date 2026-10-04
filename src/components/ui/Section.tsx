import type { ReactNode } from 'react'

import {
  sectionChrome,
  sectionIndex,
  sectionTone,
  type SectionId,
  type SectionTone,
} from '../../config/sections'
import { SHEET_SURFACE } from '../../lib/sheetTone'
import { Card } from './Card'
import { Reveal } from './Reveal'
import { Stack } from './Stack'

/**
 * Cor do numero do bloco.
 *
 * Os neutros (rotulo, caixa, titulo, subtitulo) nao precisam de variante: sao
 * tokens `ink-*` e a folha escura os inverte por CSS. O accent, que tambem e
 * preenchimento de botao, fica explicito — sobre fundo escuro o `brand-600`
 * perde contraste de leitura e o tom legivel e o `brand-400`.
 */
const NUMBER_TONE: Record<SectionTone, string> = {
  light: 'text-brand-600',
  dark: 'text-brand-400',
}

interface SectionProps {
  id: SectionId
  /** Numero do bloco, exibido no rotulo tecnico do cabecalho. */
  number: string
  eyebrow: string
  title?: string
  subtitle?: ReactNode
  /** Camada decorativa atras do conteudo (malha, cena 3D). */
  background?: ReactNode
  className?: string
  /** Renderiza os filhos em largura total, fora da coluna `max-w-6xl`. */
  fullBleed?: boolean
  children: ReactNode
}

/**
 * Casca padrao de secao: uma folha da mesa.
 *
 * O cabecalho virou uma caixa (`Card`) com a mesma gramatica de sempre
 * (`NN / ROTULO` + titulo + subtitulo), o que da ritmo de documento tecnico em
 * vez de uma sequencia de blocos soltos e aproxima o titulo do conteudo. Tom e
 * posicao de empilhamento vem de `src/config/sections.ts` — nenhuma secao
 * escolhe a propria pele.
 */
export function Section({
  id,
  number,
  eyebrow,
  title,
  subtitle,
  background,
  className = '',
  fullBleed = false,
  children,
}: SectionProps) {
  const headingId = `${id}-title`
  const tone = sectionTone(id)

  return (
    <Stack
      id={id}
      tone={tone}
      chrome={sectionChrome(id)}
      index={sectionIndex(id)}
      background={background}
      className={`${SHEET_SURFACE[tone]} ${className}`.trim()}
      aria-labelledby={title ? headingId : undefined}
    >
      {/* Em `fullBleed` o container abriga so o cabecalho: sem `pb`, o vao ate o
          conteudo fica igual ao das demais secoes (apenas o `mt` abaixo). */}
      <div
        className={`relative mx-auto my-auto w-full max-w-6xl px-6 sm:px-8 ${
          fullBleed ? 'pt-20 lg:pt-28' : 'py-20 lg:py-28'
        }`}
      >
        <Card as="header" className="p-6 sm:p-8">
          <Reveal className="text-center lg:text-left">
            <p className="mono-label text-ink-500">
              <span className={NUMBER_TONE[tone]}>{number}</span>
              <span className="mx-2 text-ink-300">/</span>
              {eyebrow}
            </p>

            {title ? (
              <h2
                id={headingId}
                className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-balance text-ink-900 sm:text-4xl lg:mx-0 lg:text-[2.75rem] lg:leading-[1.08]"
              >
                {title}
              </h2>
            ) : null}

            {subtitle ? (
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-justify text-ink-600 sm:text-lg lg:mx-0 lg:text-left">
                {subtitle}
              </p>
            ) : null}
          </Reveal>
        </Card>

        {fullBleed ? null : <div className="mt-6 lg:mt-8">{children}</div>}
      </div>

      {fullBleed ? <div className="mt-6 lg:mt-8">{children}</div> : null}
    </Stack>
  )
}
