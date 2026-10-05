import type { ReactNode } from 'react'

/** Aparelho retratado pela moldura; casa com a razao gravada em cada video. */
export type DeviceKind = 'phone' | 'desktop'

interface DeviceFrameProps {
  device: DeviceKind
  children: ReactNode
}

/**
 * Moldura de aparelho para o video de demonstracao.
 *
 * A tela tem a **razao exata** do arquivo — celular `574:1280`, computador
 * `1202:720` —, entao o video preenche o quadro sem letterbox nem corte (era o
 * que virava um "quadrado estranho" no meio do painel). So a tela e definida; o
 * resto (borda, alto-falante, suporte) e decorativo e some dos leitores de tela
 * com `aria-hidden`.
 *
 * As cores vem dos tokens de void (`bg-void-*`) em vez dos neutros invertiveis:
 * uma moldura de aparelho precisa ser preta nos dois tons, nao virar branca na
 * folha escura.
 */
export function DeviceFrame({ device, children }: DeviceFrameProps) {
  return device === 'phone' ? (
    <PhoneFrame>{children}</PhoneFrame>
  ) : (
    <DesktopFrame>{children}</DesktopFrame>
  )
}

interface FrameProps {
  children: ReactNode
}

/** Celular em pe: bezel de cantos discretos, com alto-falante e indicador. */
function PhoneFrame({ children }: FrameProps) {
  return (
    <div
      data-device="phone"
      className="relative h-[min(40vh,340px)] shrink-0 rounded-xl border border-white/10 bg-void-950 p-[0.6rem] shadow-lift sm:h-[min(50vh,440px)] lg:h-[min(68vh,640px)]"
    >
      <div
        data-screen="phone"
        className="relative aspect-[574/1280] h-full overflow-hidden rounded-lg bg-void-900"
      >
        {children}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[0.55rem] h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/15"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-[0.55rem] left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/10"
        />
      </div>
    </div>
  )
}

/** Computador: tela larga sobre um suporte, sem depender de imagem. */
function DesktopFrame({ children }: FrameProps) {
  return (
    <div data-device="desktop" className="w-full max-w-[620px] shrink-0">
      <div className="rounded-xl border border-white/10 bg-void-950 p-[0.55rem] shadow-lift">
        <div
          data-screen="desktop"
          className="relative aspect-[1202/720] w-full overflow-hidden rounded-lg bg-void-900"
        >
          {children}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-[0.45rem] h-1 w-12 -translate-x-1/2 rounded-full bg-white/15"
          />
        </div>
      </div>
      <span aria-hidden="true" className="mx-auto block h-4 w-16 bg-void-950" />
      <span
        aria-hidden="true"
        className="mx-auto block h-2 w-44 rounded-b-lg rounded-t-sm bg-void-950"
      />
    </div>
  )
}
