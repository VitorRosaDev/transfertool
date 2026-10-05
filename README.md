# TransferTool — Landing Page

Página única (SPA) que apresenta o **TransferTool** (coleta offline-first no celular + automação RPA no desktop para transferências de almoxarifado) e funciona como **hub de downloads** das duas aplicações.

Bilíngue (pt-BR / EN), estática, sem backend. Publicada como arquivos estáticos.

---

## Stack

| Camada    | Escolha                                                             |
| :-------- | :------------------------------------------------------------------ |
| Build     | Vite 8 + TypeScript (strict)                                        |
| UI        | React 19 + Tailwind CSS v4 (`@theme` como design system)            |
| Animação  | Framer Motion (`whileInView`, respeitando `prefers-reduced-motion`) |
| i18n      | react-i18next + i18next (pt-BR padrão, EN alternativo)              |
| Fontes    | `@fontsource` self-hosted — Space Grotesk (títulos) e Inter (texto) |
| QR Code   | `qrcode.react` (renderizado localmente, sem API externa)            |
| Testes    | Vitest + Testing Library (jsdom)                                    |
| Qualidade | ESLint (flat config) + Prettier                                     |

> **Sem requisições a terceiros por padrão.** Fontes, QR Code e ícones (SVG inline) são locais. O único recurso externo possível é o Google Analytics, e só depois de consentimento explícito.
>
> **Carregamento sob demanda.** O cubo 3D da dobra inicial (`three` + React Three Fiber) entra por import dinâmico, em chunk próprio, depois do primeiro quadro — o JavaScript da interface chega primeiro. Os cinco vídeos da seção _Como funciona_ também só são baixados quando o carrossel se aproxima da janela.

---

## Requisitos

- Node.js 22.22+ (validado em Node 26) — mínimo exigido pelo toolchain (Vite 8 / TypeScript 6 / jsdom)
- npm 10+

## Scripts

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento (http://localhost:5173)
npm run build      # build de produção em ./dist
npm run preview    # serve o ./dist localmente
npm run typecheck  # tsc --noEmit
npm test           # Vitest (execução única)
npm run test:watch # Vitest em watch
npm run lint       # ESLint
npm run format     # Prettier --write
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` (não versionado) e preencha. Todas são **opcionais** — sem elas a página funciona em modo seguro.

| Variável                    | Padrão sem valor                       | Para que serve                                                                      |
| :-------------------------- | :------------------------------------- | :---------------------------------------------------------------------------------- |
| `VITE_GA_ID`                | vazio → **nenhum script de terceiros** | Measurement ID do GA4 (`G-XXXXXXXXXX`). Sem ele, a camada de analytics fica inerte. |
| `VITE_RELEASES_READY`       | `false` → cards "em preparação"        | Mude para `true` quando os instaladores estiverem publicados.                       |
| `VITE_RELEASES_PAGE_URL`    | repositório público de releases        | Página usada no QR Code do APK e como fallback.                                     |
| `VITE_DESKTOP_DOWNLOAD_URL` | asset `v1.2.0` no repo de releases     | URL direta do `TransferToolRPA-Setup-1.2.0.exe`.                                    |
| `VITE_MOBILE_DOWNLOAD_URL`  | asset `v1.2.0` no repo de releases     | URL direta do `TransferTool-1.2.0.apk`.                                             |

### Ativar os downloads (passo a passo)

1. Publique os binários no repositório **público** de releases (ver `ECOSYSTEM_CONTEXT.md`).
2. No `.env.local` (localmente) ou no workflow de deploy (CI), ajuste as URLs e defina:
   ```
   VITE_RELEASES_READY=true
   ```
3. Rode `npm run build` novamente. Os botões passam de "Indisponível no momento" para link direto de download, e cada clique dispara o evento `download_started` (apenas com consentimento).

---

## Estrutura

```
src/
├── assets/
│   ├── logo.png                     # logo usado nos componentes (importado e hasheado)
│   └── videos/Step_1..5.mp4         # demonstração de cada passo, "scrubbada" no carrossel
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx               # header fixo, menu mobile, pele por folha
│   │   ├── LanguageToggle.tsx       # PT/EN com aria-pressed
│   │   ├── CookieBanner.tsx         # consentimento LGPD
│   │   └── Footer.tsx               # assinatura + canais em ícones
│   ├── sections/
│   │   ├── Hero.tsx                 # folha inicial: cubo 3D, datilografia, recuo no scroll
│   │   ├── Overview.tsx + OverviewProducts.tsx
│   │   ├── HowItWorks.tsx           # carrossel de 5 passos, com vídeo e moldura do aparelho
│   │   ├── Downloads.tsx + DownloadCard.tsx
│   │   ├── Privacy.tsx · Faq.tsx
│   │   └── Research.tsx            # folha final: origem científica do ecossistema
│   └── ui/                          # Stack (folha), Section, Card, Button, Reveal, ShapeGrid, StepCarousel, DeviceFrame, icons
├── config/
│   ├── sections.ts                  # fonte única: ordem, tom, pele e rótulos das folhas
│   ├── site.ts                      # links do autor
│   └── downloads.ts                 # artefatos, versões, URLs, flag de disponibilidade
├── i18n/
│   ├── index.ts                     # detecção de idioma + metadados do documento
│   ├── i18next.d.ts                 # tipagem estrita das chaves
│   └── locales/{pt-BR,en}.json      # 154 chaves, paridade 1:1
├── lib/
│   ├── analytics.ts                 # GA4 + Consent Mode v2 (única porta de saída)
│   ├── stepScroll.ts                # mapa de fases (scrub/slide) do carrossel
│   ├── useSectionTheme.ts           # tom da folha que atravessa o cabeçalho
│   └── sheetTone.ts                 # contexto de tom + superfícies das folhas
├── styles/index.css                 # tokens @theme, tons das folhas, base
└── test/                            # setup + 16 arquivos de teste (94 casos)
public/img/LOGO.png                  # favicon / imagem de compartilhamento
index.html                           # meta tags, OG, JSON-LD, <html lang>
```

> **Vídeos dos passos.** `src/assets/videos/Step_1..5.mp4` (5 arquivos, ≈3,9 MB no total, 5–7 s cada)
> são importados pelo Vite e saem com hash em `dist/assets/`; são eles que sustentam o carrossel da
> seção _Como funciona_. São mudos e sem legendas — a narração é o texto ao lado de cada vídeo.
> Enquanto o carrossel não se aproxima da janela, eles ficam em `preload="metadata"`: o navegador lê
> apenas o cabeçalho de cada arquivo, e o download começa cerca de uma tela antes de a seção aparecer.

---

## Seção 02 — Como funciona

A seção gasta altura no eixo vertical (`h-[500vh]`) e prende um viewport `sticky` na tela; o trilho
desliza na horizontal. O movimento **não** é uma interpolação única: `src/lib/stepScroll.ts` divide o
progresso em `2n − 1` fases de igual largura, e cada fase tem um significado.

| Fase  | Eixo horizontal                       | Vídeo e texto                             |
| :---- | :------------------------------------ | :---------------------------------------- |
| par   | trilho **parado** no passo `s`        | vídeo roda de 0 a 1; texto do passo entra |
| ímpar | anda **exatamente um painel**, linear | texto do passo anterior cai               |

Com 5 passos são 9 fases: `scrub(0) · slide(0→1) · scrub(1) · … · scrub(4)`. As fases se encontram em
quina — o fim de um scrub já é o início do slide seguinte —, então não há overshoot nem espera. O
mesmo progresso alimenta a barra da base (`scaleX`), e cada vídeo é "scrubbado" com `currentTime`, o
que torna o movimento reversível ao rolar para cima.

As **quinas seguem secas**: trilho, texto e barra andam no progresso cru. Quem ganha mola é só o
vídeo — uma `useSpring` (`stiffness 170 / damping 28 / mass 0.6`) amacia o alvo antes de ele virar
`currentTime`, para que cada evento de roda não faça o vídeo saltar de keyframe em keyframe. A
escrita sai **uma vez por quadro** (`requestAnimationFrame`) e espera o seek anterior terminar:
disparar em cima de um seek em curso faz o navegador cancelar o que estava pela metade. Medido no
navegador no vídeo de 5,07 s, 50 escritas encadeadas (uma por quadro) concluíam **9 a 12** seeks e
punham **13 ou 14** quadros na tela, com saltos de até 2,2 s; com a espera, todo seek que começa
termina (24/24 e 21/21 numa rajada de roda) e o intervalo entre quadros fica no passo natural do
arquivo (~0,17 s).

Cada passo é emoldurado pelo aparelho em que a demonstração roda (`DeviceFrame`) — os três primeiros
no celular (retrato `574:1280`) e os dois últimos no computador (paisagem `1202:720`). A tela tem a
razão exata do arquivo, então o vídeo a preenche sem letterbox nem corte.

Com `prefers-reduced-motion`, `sticky`, scrub e barra saem de cena: os cinco painéis viram um
carrossel de rolagem com `snap-x`, cada vídeo parado no primeiro quadro, e as molduras continuam lá.

---

## Deploy no GitHub Pages

A página é publicada em **https://vitorrosadev.github.io/transfertool/** por meio do GitHub
Actions (`.github/workflows/deploy.yml`). Não há passo manual: todo push em `main` builda e publica.

### Como funciona

1. `actions/checkout` + `actions/setup-node` (Node 22) + `npm ci`.
2. Gate de qualidade: `npm run lint` → `npm run typecheck` → `npm test`.
3. `npm run build` com `VITE_RELEASES_READY=true` (libera os botões de download).
4. `actions/configure-pages` → `actions/upload-pages-artifact` (`./dist`) → `actions/deploy-pages`.

### Pré-requisitos (uma única vez)

- O repositório precisa se chamar **`transfertool`** — o nome do repo é o caminho da URL
  (`vitorrosadev.github.io/transfertool/`).
- Em **Settings → Pages → Source**, selecione **GitHub Actions**.

### Analytics (opcional)

`VITE_GA_ID` é lido de `secrets.VITE_GA_ID`. Sem o secret, a camada de analytics permanece inerte
(nenhum script de terceiros). Para ativar:

```bash
gh secret set VITE_GA_ID --body "G-XXXXXXXXXX"
```

Notas:

- O build usa `base: './'` (caminhos relativos), mantendo JS, CSS, fontes e imagens funcionando
  sob o subcaminho `/transfertool/`.
- A página é single-page com navegação por âncora: **não é necessário** `404.html` nem rewrite.
- Nenhum binário grande vai para o repositório — os instaladores ficam no repositório público de
  releases do GitHub e são baixados diretamente. O asset responde `Content-Disposition:
attachment`, então o download acontece **na mesma aba**, sem sair do site nem abrir o GitHub.
- `og:url`, `og:image`, `twitter:image` e o campo `image` do JSON-LD já usam a URL absoluta de
  produção, e `index.html` inclui `<link rel="canonical">`.

---

## Privacidade e analytics

- `src/lib/analytics.ts` é a **única** porta de saída de dados da página.
- Sem `VITE_GA_ID`, o módulo é no-op: nenhum script, nenhum cookie, nenhuma requisição externa (validado em navegador: 0 scripts externos).
- Com `VITE_GA_ID`, o `gtag.js` só é injetado **depois** do clique em "Aceitar", com Consent Mode v2 na ordem `consent:default` → `js` → `config` e `anonymize_ip: true`.
- A escolha fica em `localStorage` (`transfertool.analytics-consent`) e pode ser revista a qualquer momento pelo link "Preferências de cookies" no rodapé (e pelo botão na seção Privacidade).
- Eventos enviados: `consent_granted`, `download_started`, `faq_opened`, `language_changed`.

---

## Segurança

- Os únicos recursos externos são o Google Analytics (após consentimento explícito) e os assets de release no GitHub (download direto via HTTPS).
- Links externos abertos em nova aba usam `rel="noopener noreferrer"`; os links de download permanecem na aba atual.
- Nenhum segredo é hardcoded no `src/`; as variáveis de ambiente ficam em `.env.local` (não versionado, coberto pelo `.gitignore`).
- Os headers de segurança são gerenciados pela plataforma de hospedagem; não há configuração de servidor neste projeto estático.

---

## Desempenho

- O JavaScript sai em **dois chunks**: a interface (`index-*.js`, ≈495 kB / **158 kB gzip**) e a cena 3D
  (`TransferCoreCanvas-*.js`, ≈914 kB / 242 kB gzip), buscada só depois do primeiro quadro.
- Os cinco vídeos (≈3,9 MB) são arquivos estáticos em `dist/assets/`, fora do bundle, e só baixam
  quando o carrossel se aproxima da janela.
- Fontes self-hosted em subset latin (3 pesos por família) — sem requisição a CDN de fontes.

---

## Testes

```bash
npm test
```

94 casos cobrindo: `analytics` (consentimento, injeção do script, filtragem de eventos), `LanguageToggle` (troca, persistência, `<html lang>`), `CookieBanner` (estados, recusa, reabertura), `DownloadCard` (estado "em preparação", link liberado, QR Code), `TransferCoreCanvas` (ponteiro, giroscópio, permissão e limpeza de listeners), `Faq` (acordeão acessível), `Navbar`, `Footer`, `sections` (ordem, alternância de tons, paridade i18n), `Research` (origem científica, artigo "em elaboração"), `stepScroll` (fases, quinas e monotonicidade do trilho), `DeviceFrame` (razão de cada aparelho e chrome oculto dos leitores de tela) e `StepCarousel` (painéis, ordem de composição, movimento reduzido e o download adiado dos vídeos).
