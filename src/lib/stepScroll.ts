/**
 * Mapa de fases do carrossel de passos.
 *
 * A secao "Como funciona" gasta altura no eixo vertical e traduz esse progresso
 * em um trilho horizontal — mas o movimento nao e uma interpolacao unica. Ele
 * alterna fases de **scrub** (a tela trava no passo e o video roda) com fases de
 * **slide** (o trilho anda de um passo para o seguinte). Com `count` passos sao
 * `2*count - 1` fases, abrindo e fechando em scrub:
 *
 *   scrub(0) · slide(0→1) · scrub(1) · slide(1→2) · … · scrub(count-1)
 *
 * O mapa alimenta tres valores:
 * - `xVw`: deslocamento do trilho (0 a `-(count-1)*100` vw). Fica **constante**
 *   durante o scrub — e o que "trava" a tela no passo — e anda **linearmente**
 *   durante o slide, sem easing, para a troca de eixo ser seca;
 * - `scrub[i]`: progresso 0..1 do video do passo `i` (parado ate chegar a vez);
 * - `reveal[i]`: presenca do bloco de texto do passo `i` — sobe junto com o
 *   scrub e so cai no slide de saida, depois que o video terminou.
 */
export interface StepScroll {
  /** Deslocamento horizontal do trilho, em `vw` (negativo: avanca para a esquerda). */
  xVw: number
  /** Progresso de scrub de cada video, de 0 a 1. */
  scrub: number[]
  /** Presenca de cada bloco de texto, de 0 a 1. */
  reveal: number[]
  /** Passo que ocupa a tela nesta fase. */
  activeStep: number
}

/** Limita `value` ao intervalo `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Numero de fases alternadas (scrub + slide) para `count` passos; sempre ≥ 1. */
export function phaseCount(count: number): number {
  return Math.max(2 * count - 1, 1)
}

/**
 * Deslocamento do trilho em `vw`, a partir de quantos passos ja rolaram.
 *
 * O zero sai positivo: `-0 * 100` produz `-0`, que compararia diferente de `0`
 * em `Object.is` (usado pelo `toBe` dos testes) sem ser um deslocamento real.
 */
function travelVw(travelled: number): number {
  return travelled > 0 ? -travelled * 100 : 0
}

/**
 * Traduz o progresso do scroll da secao no estado do carrossel.
 *
 * O progresso e dividido em `phaseCount` fases de igual largura. Fase par `2s` e
 * o scrub do passo `s` (trilho travado, video e texto avancando); fase impar
 * `2s+1` e o slide do passo `s` para o `s+1` (trilho andando, texto do passo
 * anterior saindo). Os limites caem exatamente nas quinas: o fim de um scrub,
 * `x` ja vale o inicio do slide seguinte — sem overshoot.
 */
export function stepScroll(progress: number, count: number): StepScroll {
  const steps = Math.max(count, 1)
  const phases = phaseCount(steps)
  const width = 1 / phases

  // O progresso chega do `scrollYProgress`; um valor nao finito (secjao ainda
  // sem medida) cai no inicio em vez de contaminar o trilho com `NaN`.
  const p = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0
  const phase = Math.min(Math.floor(p / width), phases - 1)
  const t = clamp((p - phase * width) / width, 0, 1)

  const scrub = new Array<number>(steps).fill(0)
  const reveal = new Array<number>(steps).fill(0)

  if (phase % 2 === 0) {
    // Scrub do passo `step`: o que veio antes ja acabou, o trilho esta parado.
    const step = phase / 2
    scrub.fill(1, 0, step)
    scrub[step] = t
    reveal.fill(1, 0, step)
    reveal[step] = t

    return { xVw: travelVw(step), scrub, reveal, activeStep: step }
  }

  // Slide do passo `step` para o `step + 1`: trilho anda, texto anterior sai.
  const step = (phase - 1) / 2
  scrub.fill(1, 0, step + 1)
  reveal.fill(1, 0, step + 1)
  reveal[step] = 1 - t

  return { xVw: travelVw(step + t), scrub, reveal, activeStep: step + 1 }
}
