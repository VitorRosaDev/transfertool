import { describe, expect, it } from 'vitest'

import { phaseCount, stepScroll } from '../lib/stepScroll'

/** Secao com os cinco passos da pagina e as nove fases que eles geram. */
const COUNT = 5
const PHASES = phaseCount(COUNT)
/** Largura de cada fase no progresso da secao. */
const WIDTH = 1 / PHASES

/** Progresso no ponto `t` (0..1) de uma fase. */
const at = (phase: number, t = 0) => (phase + t) * WIDTH

/** Um fio antes de um limite — para ler o fim de uma fase, nao o comeco da outra. */
const justBefore = (progress: number) => progress - 1e-9

describe('lib/stepScroll', () => {
  it('abre travado no primeiro passo, com o trilho no inicio', () => {
    const state = stepScroll(0, COUNT)

    expect(state.xVw).toBe(0)
    expect(state.scrub).toEqual([0, 0, 0, 0, 0])
    expect(state.reveal).toEqual([0, 0, 0, 0, 0])
    expect(state.activeStep).toBe(0)
  })

  it('trava o trilho durante toda a fase de scrub', () => {
    // Fase 2 e o scrub do passo 1: o eixo horizontal tem de ficar imovel.
    for (const t of [0, 0.25, 0.5, 0.75, 0.999]) {
      expect(stepScroll(at(2, t), COUNT).xVw).toBe(-100)
    }
  })

  it('roda o video do passo ao longo do scrub dele', () => {
    expect(stepScroll(at(2), COUNT).scrub[1]).toBe(0)
    expect(stepScroll(at(2, 0.5), COUNT).scrub[1]).toBeCloseTo(0.5, 6)
    expect(stepScroll(at(2, 0.999), COUNT).scrub[1]).toBeCloseTo(0.999, 3)

    // O que veio antes ja terminou; o que vem depois ainda nao comecou.
    const middle = stepScroll(at(2, 0.5), COUNT)

    expect(middle.scrub[0]).toBe(1)
    expect(middle.scrub[1]).toBeCloseTo(0.5, 6)
    expect(middle.scrub.slice(2)).toEqual([0, 0, 0])
  })

  it('anda exatamente um passo durante o slide, sem tocar os videos', () => {
    // Fase 1 e o slide do passo 0 para o 1.
    expect(stepScroll(at(1), COUNT).xVw).toBeCloseTo(0, 6)
    expect(stepScroll(at(1, 0.5), COUNT).xVw).toBe(-50)
    expect(stepScroll(justBefore(at(2)), COUNT).xVw).toBeCloseTo(-100, 3)

    const middle = stepScroll(at(1, 0.5), COUNT)

    expect(middle.scrub[0]).toBe(1) // o video anterior ja terminou
    expect(middle.scrub[1]).toBe(0) // o proximo so comeca depois que ele para
    expect(middle.activeStep).toBe(1) // o alvo do slide e o passo que chega
  })

  it('termina no ultimo passo, com o trilho travado no fim', () => {
    const state = stepScroll(1, COUNT)

    expect(state.xVw).toBe(-(COUNT - 1) * 100)
    expect(state.scrub).toEqual([1, 1, 1, 1, 1])
    expect(state.reveal).toEqual([1, 1, 1, 1, 1])
    expect(state.activeStep).toBe(COUNT - 1)
  })

  it('so mostra o texto depois que o passo trava e o esconde na saida', () => {
    expect(stepScroll(at(2), COUNT).reveal[1]).toBe(0)
    expect(stepScroll(at(2, 0.5), COUNT).reveal[1]).toBeCloseTo(0.5, 6)
    expect(stepScroll(justBefore(at(3)), COUNT).reveal[1]).toBeCloseTo(1, 3)
    // ...mas ja saiu quando o trilho termina de andar para o passo seguinte.
    expect(stepScroll(justBefore(at(4)), COUNT).reveal[1]).toBeCloseTo(0, 3)
  })

  it('nunca recua nem estoura o trilho, com quinas exatas', () => {
    let previous = stepScroll(0, COUNT).xVw

    for (let step = 1; step <= 1000; step += 1) {
      const { xVw } = stepScroll(step / 1000, COUNT)

      expect(xVw).toBeLessThanOrEqual(previous + 1e-9)
      expect(xVw).toBeGreaterThanOrEqual(-(COUNT - 1) * 100)
      previous = xVw
    }

    expect(previous).toBe(-(COUNT - 1) * 100)
  })

  it('nao contamina o trilho quando a secao ainda nao tem medida', () => {
    const state = stepScroll(Number.NaN, COUNT)

    expect(state.xVw).toBe(0)
    expect(state.scrub).toEqual([0, 0, 0, 0, 0])
    expect(state.activeStep).toBe(0)
  })

  it('lida com a secao de um unico passo', () => {
    const state = stepScroll(0.5, 1)

    expect(state.xVw).toBe(0)
    expect(state.scrub).toEqual([0.5])
    expect(state.reveal).toEqual([0.5])
    expect(state.activeStep).toBe(0)
  })
})
