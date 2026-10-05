import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

import i18n from '../i18n'

/**
 * jsdom nao implementa IntersectionObserver, usado pelo `whileInView` do
 * Framer Motion. O stub reporta o elemento imediatamente como visivel para que
 * o conteudo seja renderizado de forma deterministica nos testes.
 */
class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds: readonly number[] = [0]

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    const rect = target.getBoundingClientRect()

    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          target,
          time: 0,
          boundingClientRect: rect,
          intersectionRect: rect,
          rootBounds: null,
        } as IntersectionObserverEntry,
      ],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve(): void {}

  disconnect(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver

/**
 * jsdom tambem nao implementa `matchMedia` nem `ResizeObserver`.
 *
 * Os dois entram na camada de empilhamento: `matchMedia` responde a preferencia
 * por menos movimento (`useReducedMotion`, do Framer Motion) e a medicao de
 * alturas, `ResizeObserver` acompanha a altura de cada folha.
 *
 * Os stubs respondem o caso base: nenhuma media casa e nenhum redimensionamento
 * e reportado. Assim o comportamento nos testes e o mesmo de hoje — pagina sem
 * reducao de movimento e folhas medidas apenas na montagem.
 */
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

class ResizeObserverStub {
  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}
}

if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

/*
  jsdom nao implementa a selecao de recurso de midia: `HTMLMediaElement.load()`
  so existe para registrar "nao implementado" no console. O carrossel chama
  `load()` quando o download dos videos e liberado, entao o stub mantem a saida
  limpa — ele nao toca em nada que os testes observam (atributos do elemento).
*/
HTMLMediaElement.prototype.load = function load(): void {}

// Idioma deterministico em todos os testes e isolamento de storage.
beforeEach(async () => {
  await i18n.changeLanguage('pt-BR')
})

afterEach(() => {
  cleanup()

  // Remove qualquer gtag.js injetado por um teste anterior: a injecao e unica por
  // design, entao residuo no <head> quebraria asserts de "nenhum script externo".
  document.querySelectorAll('script[data-transfertool-ga]').forEach((script) => script.remove())

  window.localStorage.clear()
  delete window.gtag
  delete window.dataLayer

  // Nao permite que um stub de ambiente vaze para o proximo arquivo de teste.
  vi.unstubAllEnvs()
})
