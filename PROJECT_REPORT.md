# PROJECT_REPORT.md — TransferTool Landing Page

**Projeto:** Landing page bilíngue do TransferTool (vitrine + hub de downloads)
**Local:** `C:\dev\TransferTool\TransferTool Landing Page`
**Data da sessão:** 28/09/2026
**Modo:** implementação completa (Act), sobre plano previamente aprovado
**Resultado:** ✅ typecheck, lint, 26 testes e build de produção passando; validado em navegador real (desktop 1440px e mobile 390px)

---

## 1. Escopo entregue

| Item                                                                               | Status |
| :--------------------------------------------------------------------------------- | :----- |
| Scaffold Vite 8 + React 19 + TypeScript (strict)                                   | ✅     |
| Design system Tailwind v4 com tokens da marca (`#2563EB`)                          | ✅     |
| i18n pt-BR/EN com tipagem estrita (177 chaves, paridade 1:1)                       | ✅     |
| 6 seções: Hero · Visão geral · Como funciona · Downloads · Privacidade · FAQ       | ✅     |
| Navbar fixa + menu mobile + alternador de idioma                                   | ✅     |
| Cards de download com versão, tamanho, QR Code e estado "em preparação"            | ✅     |
| Consentimento LGPD + GA4 com Consent Mode v2                                       | ✅     |
| SEO semântico (header/nav/main/section/footer, `h1` único, meta/OG/JSON-LD, `alt`) | ✅     |
| Testes automatizados (Vitest + RTL, 26 casos)                                      | ✅     |
| ESLint + Prettier                                                                  | ✅     |
| Acessibilidade (skip link, `aria-*`, foco visível, `prefers-reduced-motion`)       | ✅     |
| Validação em navegador real (desktop + mobile)                                     | ✅     |
| `README.md`, `ECOSYSTEM_CONTEXT.md`, `PROJECT_REPORT.md`                           | ✅     |

---

## 2. Log de execução (cronológico)

### 2.1 Verificação de ambiente

```
node -v            → v26.7.0
npm -v             → 12.0.2
git --version      → git version 2.46.0.windows.1
git status         → fatal: not a git repository
```

Estado inicial do diretório: apenas `img/` (`LOGO.png`, 15,4 KB) e `Release_Installers/`
(`TransferToolRPA-Setup-1.1.0.exe` = 168.253,9 KB ≈ 164 MB · `TransferTool-1.1.1.apk` =
98.189,5 KB ≈ 96 MB).

> **Decisão registrada:** não inicializar repositório Git automaticamente. O `.gitignore` já
> cobre binários e segredos, mas criar o remote é decisão do autor.

### 2.2 Arquivos de configuração criados

| Arquivo                           | Função                                                                                                                |
| :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| `package.json`                    | scripts `dev`, `build`, `preview`, `typecheck`, `test`, `test:watch`, `lint`, `format`                                |
| `.gitignore`                      | `node_modules`, `dist`, `Release_Installers/`, `public/downloads/`, `.env*`, logs, editores                           |
| `.prettierrc` / `.prettierignore` | sem ponto e vírgula, aspas simples, 100 colunas                                                                       |
| `tsconfig.json`                   | ES2022, `moduleResolution: bundler`, `strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedSideEffectImports` |
| `vite.config.ts`                  | plugins `react` + `@tailwindcss/vite`, `base: './'`, `target: es2022`                                                 |
| `vitest.config.ts`                | jsdom, `globals: true`, `setupFiles: ./src/test/setup.ts`                                                             |
| `eslint.config.js`                | flat config (JS + typescript-eslint + react-hooks + react-refresh + prettier)                                         |
| `.env.example`                    | documentação das 5 variáveis de build                                                                                 |

**Decisão registrada — `base: './'`:** a landing é single-page sem router, então caminhos
relativos são seguros e permitem publicar tanto na raiz do domínio quanto em subpasta do
Hostinger sem reconfigurar o build.

### 2.3 Dependências instaladas e versões resolvidas

```
npm install react react-dom i18next react-i18next framer-motion \
  @fontsource/inter @fontsource/space-grotesk --save
  → added 14 packages, 0 vulnerabilities

npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite typescript \
  @types/react @types/react-dom @types/node vitest @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event jsdom eslint @eslint/js globals \
  typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh prettier \
  eslint-config-prettier
  → added 245 packages, 0 vulnerabilities

npm install qrcode.react
  → added 1 package
```

Versões efetivas (`npm ls --depth=0`):

```
react 19.3.0 · react-dom 19.3.0 · framer-motion 13.4.4 · i18next 26.4.2 ·
react-i18next 17.0.15 · tailwindcss 4.3.3 · @tailwindcss/vite 4.3.3 ·
vite 8.3.1 · @vitejs/plugin-react 6.1.1 · typescript 6.0.3 · vitest 5.0.2 ·
@testing-library/react 16.3.3 · @testing-library/jest-dom 7.0.1 ·
@testing-library/user-event 14.6.7 · jsdom 30.1.1 · eslint 10.11.0 ·
typescript-eslint 8.71.0 · eslint-plugin-react-hooks 7.1.1 · prettier 3.9.9 ·
qrcode.react 4.2.0 · @fontsource/inter 5.3.0 · @fontsource/space-grotesk 5.3.0
```

Compatibilidades verificadas por leitura de `node_modules` **antes** de escrever código:

- `framer-motion@13` exporta `motion`, `AnimatePresence` e `useReducedMotion` no entrypoint `"."`.
- `qrcode.react@4.2.0` exporta `QRCodeSVG` e `QRCodeCanvas`.
- `@testing-library/jest-dom@7` expõe o subpath `./vitest` (matchers tipados para Vitest).
- `@fontsource/*@5` oferece subsets `latin-*` (evita baixar cirílico/grego/vietnamita).
- `vitest@5` expõe `./globals` e `./config`.

### 2.4 Assets

- `img/LOGO.png` (original do autor, 15,4 KB) foi **copiado** para:
  - `public/img/LOGO.png` → favicon / `apple-touch-icon` / `og:image`. No `index.html` a
    referência é `/img/LOGO.png` e o Vite a reescreve para `./img/LOGO.png` conforme o `base`.
  - `src/assets/logo.png` → importado pelos componentes (`import logoUrl from '../../assets/logo.png'`),
    ganhando hash e caminho relativo — imune a mudança de `base`.
- O diretório `img/` original foi preservado (nada foi removido).

### 2.5 Design system (`src/styles/index.css`)

Tokens declarados em `@theme` (o Tailwind v4 gera as utilities automaticamente):

| Grupo       | Tokens                                                                                                                |
| :---------- | :-------------------------------------------------------------------------------------------------------------------- |
| Tipografia  | `--font-sans` (Inter), `--font-display` (Space Grotesk)                                                               |
| Marca       | `--color-brand-50…900`, base `#2563EB` extraída do próprio LOGO                                                       |
| Mobile      | `--color-mobile-*` (cyan `#06b6d4`)                                                                                   |
| Desktop/RPA | `--color-desktop-*` (violeta `#7c3aed`)                                                                               |
| Privacidade | `--color-privacy-*` (emerald `#10b981`)                                                                               |
| Neutros     | `--color-ink-50…900`, `--color-surface`, `--color-surface-muted`                                                      |
| Sombras     | `--shadow-card`, `--shadow-lift`                                                                                      |
| Animações   | `--animate-drift`, `--animate-drift-slow`, `--animate-float`, `--animate-pulse-soft`, `--animate-dash` + `@keyframes` |

Componentes utilitários em `@layer components`: `.text-gradient-brand`, `.grid-line-pattern`,
`.mask-fade-b`.

Base: `scroll-behavior: smooth`, `scroll-padding-top: 5.5rem` (compensa a navbar fixa),
`text-wrap: balance` nos títulos e `pretty` nos parágrafos, `:focus-visible` visível,
`::selection` na cor da marca e bloco `@media (prefers-reduced-motion: reduce)` que neutraliza
animações e transições.

Fontes self-hosted importadas em `src/main.tsx` (subset latin, 3 pesos por família:
Space Grotesk 500/600/700 e Inter 400/500/600) — **zero requisições a CDNs de fonte**.

### 2.6 Camada de i18n

`src/i18n/index.ts`:

- `SUPPORTED_LANGUAGES = ['pt-BR', 'en']`, `LANGUAGE_STORAGE_KEY = 'transfertool.language'`.
- Resolução do idioma: `localStorage` → `navigator.languages` (`pt*` → `pt-BR`, `en*` → `en`) → fallback `pt-BR`.
- Escrita em `localStorage` protegida por `try/catch` (navegação privada não quebra a página).
- Listener de `languageChanged` atualiza `<html lang>`, `document.title`, `meta[name=description]`
  e `og:locale` — mantendo o SEO coerente com o idioma ativo (a `<html lang="pt-BR">` do HTML
  estático serve crawlers; o client corrige no toggle).

`src/i18n/i18next.d.ts`: module augmentation tipando `resources.translation` com `typeof ptBR`,
o que faz `t('hero.titleLine1')` ter autocompletar e **erro de compilação para chave inexistente**.

Locales: `pt-BR.json` e `en.json` com **177 chaves cada**, verificadas por script de paridade
recursiva (`faltando em en: nenhum · extras em en: nenhum`).

### 2.7 Configuração e camada de dados

`src/config/downloads.ts`:

```ts
const FALLBACK_DESKTOP_URL = '.../releases/download/v1.1.0/TransferToolRPA-Setup-1.1.0.exe'
const FALLBACK_MOBILE_URL = '.../releases/download/v1.1.1/TransferTool-1.1.1.apk'
const releasesReady = import.meta.env.VITE_RELEASES_READY === 'true'
desktopRelease = {
  fileName: 'TransferToolRPA-Setup-1.1.0.exe',
  version: '1.1.0',
  size: '164 MB',
  available: releasesReady,
}
mobileRelease = {
  fileName: 'TransferTool-1.1.1.apk',
  version: '1.1.1',
  size: '96 MB',
  available: releasesReady,
}
downloadArtifacts = [mobileRelease, desktopRelease] // mobile primeiro: é o ponto de entrada do fluxo
```

**Decisão registrada:** a disponibilidade do download é controlada por **variável de ambiente**
e não por edição de código. Com `VITE_RELEASES_READY=false` (padrão) os cards exibem botão
desabilitado "Indisponível no momento" + explicação e o QR Code aponta para a página de releases.
Virar a chave é uma linha em `.env.local` / build do Hostinger.

`src/config/site.ts` — links públicos do autor (`linkedin`, `email`, `website`, `github`).
Os repositórios de código são privados, portanto **não são linkados** na página (evita link morto).

`src/config/sections.ts` — fonte única das folhas: `id`, `tone` (`light`/`dark`) e o
`navLabelKey`, na ordem de empilhamento. `NAV_SECTIONS` deriva daqui o menu da navbar, e
`sectionTone`/`sectionIndex` alimentam o `Stack`: nenhuma seção escolhe a própria pele.

`src/lib/analytics.ts` — a única porta de saída de dados:

| Função                       | Comportamento                                                                                                                                                                                |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hasAnalyticsId()`           | `false` quando `VITE_GA_ID` está vazio                                                                                                                                                       |
| `readConsent()`              | lê `localStorage['transfertool.analytics-consent']` → `'granted' \| 'denied' \| null`                                                                                                        |
| `grantConsent()`             | grava `'granted'`, aplica `consent: default` com `analytics_storage: granted`, injeta o `gtag.js` **uma única vez**, envia `js` + `config` (`anonymize_ip: true`) e `event: consent_granted` |
| `denyConsent()`              | grava `'denied'`, aplica `consent: update` negando `analytics_storage`. **Não injeta nada**                                                                                                  |
| `trackEvent(name, params)`   | early-return duplo: sem ID ou sem consentimento → não envia nada                                                                                                                             |
| `initAnalytics()`            | reaplica a escolha salva na inicialização do app                                                                                                                                             |
| `reopenConsentPreferences()` | dispara `transfertool:consent-reopen` (ouvido pelo banner)                                                                                                                                   |

**Decisão registrada — injeção não bloqueante:** `grantConsent()` é **síncrona** e não aguarda
o `onload` do script; os comandos são enfileirados no `dataLayer` e processados pelo gtag.js
quando ele carregar (mesmo comportamento do snippet oficial). Isso evita travar a interface em
redes lentas ou bloqueadas e torna o fluxo testável sem esperas.

### 2.8 Componentes de UI

`src/components/ui/` — `icons.tsx` (20 ícones SVG inline, `aria-hidden`, `stroke: currentColor`,
sem lib externa), `Button.tsx` (polimórfico: renderiza `<a>` quando recebe `href`, senão `<button>`),
`buttonClass.ts` (classes do botão, extraído para satisfazer `react-refresh/only-export-components`),
`Stack.tsx` (a folha: `sticky` com `top` medido, `z-index` crescente, camada de fundo opcional e o
marcador `data-section-tone`) e `Reveal.tsx` (entrada suave com `whileInView`, desativada quando
`useReducedMotion()` é `true`).

`src/components/layout/`:

- `Navbar.tsx` — header fixo que troca de pele conforme a folha que atravessa a linha do
  cabeçalho (`useSectionTheme`), âncoras, CTA, `LanguageToggle`, hambúrguer com
  `aria-expanded`/`aria-controls`, painel animado com `AnimatePresence`, fechamento por
  `Escape`, por clique em link e por `languageChanged` (assinatura de evento externo).
- `LanguageToggle.tsx` — grupo de botões `PT`/`EN` com `aria-pressed`, `title` traduzido e
  evento `language_changed`.
- `CookieBanner.tsx` — região fixa, `role="region"` + `aria-label`, botões Aceitar/Recusar,
  link para a seção Privacidade, reaparece ao ouvir `transfertool:consent-reopen`.
- `Footer.tsx` — uma linha: `© {ano} Vitor Rosa - All rights reserved.` seguida dos canais em
  ícones (LinkedIn, GitHub, e-mail, portfólio, com `aria-label` do dicionário) e do botão
  "Preferências de cookies". Fica fora do empilhamento (`z-20`) e entra depois da última folha.

### 2.9 Seções implementadas

| Seção                         | Arquivo                                 | Destaques de implementação                                                                                                                                                                   |
| :---------------------------- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero (`#inicio`)              | `Hero.tsx`                              | recuo e desbotamento do conteúdo no scroll, `h1` único com datilografia, badge com pulso, CTA duplo e cubo 3D (`TransferCoreCanvas`)                                                         |
| Visão geral (`#overview`)     | `Overview.tsx` + `OverviewProducts.tsx` | narrativa do problema em 2 parágrafos com filete de marca, bloco "A resposta", 2 cards de produto (borda superior em gradiente + bullets validados) e 4 cards de benefício técnico           |
| Como funciona (`#howItWorks`) | `HowItWorks.tsx` + `howItWorksSteps.ts` | timeline numerada de 5 passos com badge de cor por plataforma, ícone, texto e quadro de captura de tela (16:9) — substituível por `STEP_SCREENSHOT`                                          |
| Downloads (`#downloads`)      | `Downloads.tsx` + `DownloadCard.tsx`    | 2 cards com versão, plataforma, arquivo, tamanho, CTA e requisitos; QR Code (`QRCodeSVG`) só no card Android; fallback para a página de releases                                             |
| Privacidade (`#privacy`)      | `Privacy.tsx`                           | 6 selos em verde (processamento local, SQLite, sem nuvem, sem terceiros, sessão preservada, auditoria) + nota da página + botão de preferências                                              |
| FAQ (`#faq`)                  | `Faq.tsx`                               | acordeão acessível (`aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`), 7 perguntas, animação de altura com `AnimatePresence` e duração zero sob `prefers-reduced-motion` |

Composição em `src/App.tsx`: skip link → `Navbar` → `main` (6 folhas, geradas da lista de
`config/sections.ts`) → `Footer` → `CookieBanner`, com `initAnalytics()` chamado uma vez em
`useEffect`.

### 2.10 Testes automatizados

`src/test/setup.ts` — importa `@testing-library/jest-dom/vitest`, força `pt-BR` no `beforeEach`
(jsdom reporta `navigator.language = 'en-US'`), limpa `localStorage`/`gtag`/`dataLayer` no
`afterEach` e instala um stub de `IntersectionObserver` (jsdom não implementa; sem ele o
`whileInView` do Framer Motion não dispara de forma determinística).

| Arquivo                   | Casos | Cobertura                                                                                                                                                                                                           |
| :------------------------ | :---- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `analytics.test.ts`       | 10    | sem ID → sem script; recusa → sem script; `grantConsent` injeta o gtag com o ID correto; injeção única; `trackEvent` filtrado sem consentimento e encaminhado com consentimento; persistência; evento de reabertura |
| `LanguageToggle.test.tsx` | 3     | `aria-pressed` inicial, troca para EN (idioma, `<html lang>`, `localStorage`), retorno para PT                                                                                                                      |
| `CookieBanner.test.tsx`   | 5     | aparece sem escolha; recusa grava e fecha; aceite grava; não aparece com escolha salva; reaparece pelo evento do rodapé                                                                                             |
| `DownloadCard.test.tsx`   | 4     | metadados exibidos; botão desabilitado + aviso no estado "em preparação"; link direto com `rel` correto quando publicado; QR Code só quando solicitado                                                              |
| `Faq.test.tsx`            | 4     | primeiro item aberto por padrão; abre resposta ao clicar; fecha ao clicar de novo; `aria-controls` ↔ `id` do painel                                                                                                 |

Resultado: `Test Files 5 passed (5) · Tests 26 passed (26)`. Suíte verificada quanto a
instabilidade com **5 execuções consecutivas + 1 execução serial** (`--no-file-parallelism`),
todas verdes — ver item 8 da seção 2.11.

### 2.11 Validações executadas e erros corrigidos no caminho

| Etapa     | Comando             | Resultado                                       |
| :-------- | :------------------ | :---------------------------------------------- |
| Typecheck | `npm run typecheck` | ✅ 0 erros (após 3 rodadas de correção)         |
| Lint      | `npm run lint`      | ✅ 0 problemas (após 2 correções)               |
| Testes    | `npm test`          | ✅ 26/26                                        |
| Build     | `npm run build`     | ✅ `479 modules transformed` · `built in 371ms` |

**Erros encontrados e como foram resolvidos (registro fiel):**

1. **Limite de tamanho do editor** (arquivos acima de ~6.000 caracteres eram rejeitados).
   Solução: dividir os locales em blocos anexados por âncora e quebrar arquivos grandes em
   módulos coesos — surgiram assim `HeroFlow.tsx`, `OverviewProducts.tsx`, `howItWorksSteps.ts`,
   `buttonClass.ts`.

2. **`tsc` acusou 12 erros TS2345 em `t()`** — as interfaces das minhas listas de configuração
   declaravam `titleKey: string`, alargando os literais e quebrando a tipagem estrita do i18next.
   Solução: remover a anotação `: readonly X[]` e usar `] as const satisfies readonly X[]`,
   preservando os tipos literais e ainda validando o formato contra a interface.

3. **`react-hooks/set-state-in-effect`** (regra nova do eslint-plugin-react-hooks v7) apontou
   `useEffect(() => setMenuOpen(false), [t])` na Navbar. Solução idiomática: assinar o evento
   externo `i18n.on('languageChanged', ...)` dentro do efeito, chamando `setState` apenas no
   callback — o padrão recomendado pela própria regra.

4. **`react-refresh/only-export-components`** em `Button.tsx` por exportar também `buttonClass`.
   Solução: extrair o helper para `src/components/ui/buttonClass.ts` e atualizar os 6 importadores.

5. **Stub de `IntersectionObserver` com `implements IntersectionObserver` gerou TS2420/TS2345**
   (assinaturas divergentes na lib DOM do TS 6). Solução: remover `implements`, modelar como
   classe simples e converter no momento da atribuição (`as unknown as typeof IntersectionObserver`).

6. **Risco de teste pendurado:** a versão inicial de `grantConsent()` era `async` e aguardava o
   `onload` do `gtag.js`; em jsdom o script externo nunca carrega, o que deixaria a promise sem
   resolução. Solução: injeção não bloqueante com fila no `dataLayer` (também melhor em produção).

7. **Paridade de locales:** validada por script Node recursivo antes de escrever os componentes —
   `pt keys: 177 | en keys: 177 | faltando em en: nenhum | extras em en: nenhum`.

8. **Teste instável (flake) detectado na revalidação final.** Na primeira rodada completa a suíte
   ficou `26/26`, mas numa rodada posterior apareceu
   `FAIL CookieBanner > grava o aceite sem carregar scripts quando nao ha Measurement ID —
AssertionError: expected <script …(2)> to be null`.

   Diagnóstico: o teste de `analytics.test.ts` usa `vi.stubEnv('VITE_GA_ID', 'G-TESTE123')` para
   exercitar o caminho com GA4 e a chamada injeta um `<script data-transfertool-ga>` no `<head>`.
   Como `grantConsent()` é idempotente (injeta uma única vez), o elemento sobrevive entre testes, e
   o `GA_ID` é lido no **carregamento do módulo** — ou seja, o resíduo de `<head>` e/ou o stub de
   ambiente podiam alcançar o arquivo seguinte, dependendo da ordem/worker atribuído pelo Vitest.

   Correção aplicada em três frentes:

   1. `src/test/setup.ts` → `afterEach` agora remove todo `script[data-transfertool-ga]` do
      documento e chama `vi.unstubAllEnvs()`, impedindo vazamento de DOM e de ambiente.
   2. `CookieBanner.test.tsx` → `vi.hoisted(() => vi.stubEnv('VITE_GA_ID', ''))` roda **antes dos
      imports do arquivo**, garantindo que o módulo de analytics seja carregado sem Measurement ID
      neste arquivo, independentemente do que outros testes fizeram.
   3. O caso passou a afirmar explicitamente a pré-condição do cenário (`hasAnalyticsId() === false`)
      antes de checar a ausência do script, transformando um eventual flake em falha explicativa.

   Verificação: **5 execuções consecutivas** de `npx vitest run` → `Test Files 5 passed (5) ·
Tests 26 passed (26)` em todas; mais uma execução com `--no-file-parallelism` (forçando todos os
   arquivos no mesmo worker, o cenário mais propício ao vazamento) também verde.

### 2.12 Validação em navegador real

Servidores usados: `vite preview` (porta 4173, sobre o `dist/` de produção) e `vite dev`
(porta 5174, com `VITE_GA_ID=G-TESTE123ABC` exportado para exercitar o caminho de analytics).
Chrome 147 headless com CDP na porta 9222.

**a) `<head>` e estrutura semântica (produção, `/`):**

```
title: "TransferTool — Da coleta offline à automação no ERP"
lang: "pt-BR"
h1Count: 1 · mainCount: 1 · footerCount: 1 · navCount: 4 · headerCount: 3
imagesWithoutAlt: 0
externalScripts: 0
seções: inicio(H1) · overview(H2) · howItWorks(H2) · downloads(H2) ·
        privacy(H2) · faq(H2) · contact(H2)
console messages: <nenhuma>
```

**b) Fontes e tokens (CSS computado):**

```
spaceGroteskLoaded: true · interLoaded: true · fonts.status: "loaded"
h1 font-family: "Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif
body font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", ...
botão primário background-color: rgb(37, 99, 235)   // #2563EB exato
h1 color: rgb(15, 23, 42)
```

**c) Conteúdo e integridade de links:**

```
anchorsTotal: 19 · brokenAnchors: []
disabledDownloadButtons: ["Indisponível no momento", "Indisponível no momento"]
qrSvgs: 1 · faqTriggers: 7 · faqExpanded: 1 · steps: 5 · flowNodes: 4
horizontalOverflow: 0 (scrollWidth == clientWidth em 1440px e em 390px)
```

**d) Troca de idioma (clique real em "EN" e volta para "PT"):**

```
antes:   lang=pt-BR · h1="Da coleta no galpão | à transferência lançada no ERP." · nav="Visão geral"
depois(EN): lang=en · title="TransferTool — From offline collection to ERP automation"
            h1="From the warehouse floor | to the transfer posted in your ERP."
            nav="Overview" · faq[0]="Does the mobile app need internet to work?"
            meta.description atualizada · aria-pressed=true · localStorage=pt→en
volta(PT):  lang=pt-BR · h1 de volta ao português · localStorage="pt-BR"
```

**e) Banner de consentimento (LGPD):**

```
inicial:            visível=true · consent=null
após "Aceitar":     visível=false · consent="granted" · externalScripts=0 · gtag=undefined
reaberto no rodapé: visível=true
após "Recusar":     visível=false · consent="denied"
```

**f) Caminho com GA4 configurado (dev server com `VITE_GA_ID=G-TESTE123ABC`):**

```
antes do consentimento:
  gaScript=0 · externalScripts=0 · typeof window.dataLayer="undefined"
depois de "Aceitar":
  gaScriptCount=1
  gaScriptSrc="https://www.googletagmanager.com/gtag/js?id=G-TESTE123ABC"
  dataLayer=[ "consent:default", "js:...", "config:G-TESTE123ABC", "event:consent_granted", ... ]
  typeof window.gtag="function"
```

Ou seja, a ordem canônica do Consent Mode v2 (`consent:default` → `js` → `config`) está correta
e o script só aparece após o clique.

**g) Mobile (390×844):**

```
hamburgerVisible: true · desktopNav[nav ul].display: "none" · overflowHorizontal: 0
menu aberto: aria-expanded="true" · painel com ["Visão geral","Como funciona","Downloads",
  "Privacidade","FAQ","Contato","Baixar agora"]
Escape: aria-expanded="false" · painel removido do DOM
```

### 2.13 Saída do build de produção

```
vite v8.3.1 building client environment for production...
✓ 479 modules transformed.
dist/index.html                                        3,66 kB │ gzip:   1,37 kB
dist/assets/space-grotesk-latin-*.woff2/woff          12,8–17,0 kB  (3 pesos)
dist/assets/inter-latin-*.woff2/woff                  23,6–31,3 kB  (3 pesos)
dist/assets/logo-*.png                                15,80 kB
dist/assets/index-*.css                               42,45 kB │ gzip:   7,80 kB
dist/assets/index-*.js                               480,81 kB │ gzip: 150,87 kB
✓ built in 371ms

dist/ → 17 arquivos · 0,78 MB no total
paths relativos confirmados: ./assets/... e ./img/LOGO.png
```

---

## 3. Arquivos criados

**Raiz**

```
.env.example · .gitignore · .prettierrc · .prettierignore
eslint.config.js · index.html · package.json
tsconfig.json · vite.config.ts · vitest.config.ts
README.md · PROJECT_REPORT.md
```

**`public/`** — `img/LOGO.png`

**`src/`**

```
App.tsx · main.tsx · vite-env.d.ts
assets/logo.png
config/downloads.ts · config/sections.ts · config/site.ts
i18n/index.ts · i18n/i18next.d.ts · i18n/locales/pt-BR.json · i18n/locales/en.json
lib/analytics.ts · lib/heroAnchor.ts · lib/sheetTone.ts · lib/useSectionTheme.ts
lib/useTypewriter.ts
styles/index.css
components/layout/CookieBanner.tsx · Footer.tsx · LanguageToggle.tsx · Navbar.tsx
components/sections/DownloadCard.tsx · Downloads.tsx · Faq.tsx · Hero.tsx
components/sections/HowItWorks.tsx · Overview.tsx · OverviewProducts.tsx · Privacy.tsx
components/sections/TransferCoreCanvas.tsx
components/ui/Button.tsx · buttonClass.ts · Card.tsx · icons.tsx · Reveal.tsx · Section.tsx
components/ui/ShapeGrid.css · ShapeGrid.tsx · Stack.tsx
test/setup.ts · test/sections.test.ts · test/Stack.test.tsx · test/useSectionTheme.test.tsx
test/Navbar.test.tsx · test/Footer.test.tsx · test/analytics.test.ts
test/LanguageToggle.test.tsx · test/CookieBanner.test.tsx · test/DownloadCard.test.tsx
test/Faq.test.tsx · test/ShapeGrid.test.tsx · test/TransferCoreCanvas.test.tsx
```

**Fora do projeto** — `C:\dev\TransferTool\ECOSYSTEM_CONTEXT.md`

---

## 4. Decisões técnicas consolidadas nesta sessão

| #   | Decisão                                                           | Justificativa                                                                        |
| :-- | :---------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| 1   | `base: './'` no Vite                                              | Deploy na raiz **ou** em subpasta do Hostinger sem reconfigurar                      |
| 2   | Logo duplicado: `public/img` (favicon) + `src/assets` (importado) | `public` resolve o `index.html`; o import dá hash e caminho relativo aos componentes |
| 3   | Disponibilidade do download via `VITE_RELEASES_READY`             | Virar a chave sem tocar em código; estado "em preparação" honesto por padrão         |
| 4   | `grantConsent()` síncrona com fila no `dataLayer`                 | Não bloqueia a UI, não pendura testes, ordem de comandos correta                     |
| 5   | Locales com **chaves literais + `as const satisfies`**            | Erro de compilação para chave inexistente e autocompletar em `t()`                   |
| 6   | `IntersectionObserver` stubado no setup dos testes                | jsdom não implementa; sem ele o `whileInView` é não determinístico                   |
| 7   | Ícones SVG inline em vez de biblioteca                            | Menos ~40 kB no bundle e controle total do `stroke`                                  |
| 8   | QR Code gerado no cliente (`qrcode.react`)                        | Nenhuma requisição a API de QR de terceiros                                          |
| 9   | Repositórios de código **não** linkados na página                 | São privados; evita link morto para o visitante                                      |
| 10  | `Section.tsx` com `aria-labelledby`                               | Hierarquia `h1`/`h2`/`h3` explícita e auditável                                      |

---

## 5. Pendências (bloqueios externos)

| #   | Pendência                                                                              | Quem resolve | Impacto se atrasar                                            |
| :-- | :------------------------------------------------------------------------------------- | :----------- | :------------------------------------------------------------ |
| 1   | Criar o repositório **público** de releases e publicar `v1.1.0` (EXE) e `v1.1.1` (APK) | Autor        | Cards permanecem em "Em preparação"                           |
| 2   | Informar o `G-XXXX` (Measurement ID do GA4)                                            | Autor        | Nenhum script de terceiros é carregado (comportamento seguro) |
| 3   | Fornecer as capturas de tela dos 5 passos                                              | Autor        | Timeline exibe quadros reservados com a cor da plataforma     |
| 4   | Definir o domínio final e ajustar `og:image` / JSON-LD para URL absoluta               | Autor        | Compartilhamento social sem imagem                            |
| 5   | Executar o deploy no Hostinger hPanel                                                  | Autor        | —                                                             |

Nenhuma pendência impede o uso da página: todas degradam para um estado visualmente aceitável e
documentado.

---

## 6. Comandos de referência

```bash
# desenvolvimento
npm run dev

# qualidade
npm run typecheck && npm run lint && npm test

# publicar
npm run build            # gera ./dist (17 arquivos, 0,78 MB)
# enviar o CONTEÚDO de dist/ para public_html/ no hPanel

# habilitar downloads reais (após publicar as releases)
# .env.local → VITE_RELEASES_READY=true
npm run build
```

---

**Fim do relatório.** Sessão encerrada com typecheck, lint, 26 testes e build verdes, e
validação funcional em navegador (desktop e mobile) registrada na seção 2.12.

---

## 7. Padrão de empilhamento das seções (sticky stacking)

Sessão posterior: a transição entre seções passou a ser um **empilhamento de folhas** — cada seção
fica parada e a seguinte sobe por cima, alternando claro e escuro —, com a navbar trocando de pele
conforme a folha que atravessa a linha do cabeçalho. O contato (`#contact`) saiu; a informação
virou rodapé.

### 7.1 Fonte única

`src/config/sections.ts` declara ordem, tom, pele e rótulo de menu de cada folha:

```ts
inicio(dark, transparent) → overview(light, glass) → howItWorks(dark, glass)
→ downloads(light, glass) → privacy(dark, glass) → faq(light, glass)
```

`App.tsx` monta as folhas a partir dessa lista (`SHEETS` é um `Record<SectionId, …>` exaustivo, então
declarar uma folha obriga a ligar o componente), a navbar consome `NAV_SECTIONS` e o `Stack` lê
`sectionTone`/`sectionChrome`/`sectionIndex`. Nenhuma seção escolhe a própria pele.

### 7.2 Mecânica da folha (`src/components/ui/Stack.tsx`)

`position: sticky` com um `top` calculado, sem `spacer` nem margem negativa:

| Situação                                                 | `top`                                   | Efeito                                                                                                       |
| :------------------------------------------------------- | :-------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| Folha que cabe na janela (`offsetHeight <= innerHeight`) | `0`                                     | prende no topo; a próxima sobe por cima                                                                      |
| Folha mais alta que a janela                             | `innerHeight - offsetHeight` (negativo) | rola inteira e só trava quando o fim encosta na base, que é o instante em que a folha seguinte entra em cena |

`min-h-dvh` garante que nenhuma folha fique menor que a tela (sem faixa morta entre duas capas) e
`z-index` crescente (`10 + índice`) garante que a folha que chega cubra as anteriores. A medida é
refeita pelo `ResizeObserver` da folha e pelo `resize` da janela. Com `prefers-reduced-motion` a
folha apenas rola (sem `sticky`).

### 7.3 Tons sem duplicar classes

`src/styles/index.css` inverte os **neutros por token** dentro de `[data-section-tone='dark']`
(`--color-ink-*` e `--color-surface*`); como as utilidades do Tailwind compilam para
`var(--color-*)`, a mesma classe serve para os dois tons. O **accent fica explícito** onde pode ser
preenchimento ou texto — `Section` (número) e `IconTile` leem o tom por `useSheetTone()`.
Contraste medido no navegador: 7,69–19,34:1 nas folhas escuras e 4,82–18,19:1 na clara.

### 7.4 Navbar por linha de seção

`src/lib/useSectionTheme.ts` lê a altura real do `<nav>` (`data-site-nav`) e escolhe a **última**
folha cujo retângulo atravessa essa linha, devolvendo `{ tone, chrome }`. A troca acontece no
instante em que a borda da próxima folha cruza o cabeçalho.

`chrome` vem de `src/config/sections.ts` e define como o cabeçalho pousa: `glass` (vidro do tom,
sempre com blur e filete) ou `transparent` (solto, só onde existe cena de fundo — hoje, o hero).

| Folha sob a linha                | Pele do cabeçalho                                                                 |
| :------------------------------- | :-------------------------------------------------------------------------------- |
| `inicio` (`chrome: transparent`) | solto, sem fundo nem blur, texto claro sobre a malha                              |
| folha clara (`glass`)            | vidro na cor da folha (`bg-white/85`) + `backdrop-blur-xl` + filete `ink-200/70`  |
| folha escura (`glass`)           | vidro na cor da folha (`bg-void-900/95`) + `backdrop-blur-xl` + filete `white/10` |

O vidro usa a **própria cor da folha** — `bg-surface` na clara e `void-900` na escura, que é
exatamente a superfície de `SHEET_SURFACE.dark`. Assentado numa seção escura, o cabeçalho compõe
`rgb(11,14,18)`, idêntico ao fundo da seção: o vidro vem do blur e do filete, não de um tom próprio.

A troca de pele é **seca** (tinta e vidro no mesmo quadro) e quem faz a chegada é o
`backdrop-filter`, que anima em 300ms. A primeira versão animava as cores; medida no pior caso —
pele escura já aplicada enquanto a faixa do cabeçalho ainda está sobre a folha clara —, ela punha
barra e tinta no meio do caminho ao mesmo tempo:

|                               | animando cores (200ms)                       | troca seca + blur                |
| :---------------------------- | :------------------------------------------- | :------------------------------- |
| pior contraste na travessia   | **2,30:1** (t≈100ms)                         | **17,4:1**                       |
| cor da barra na travessia     | `rgb(107,109,110)` cinza                     | `rgb(23,26,30)`                  |
| pele escura sobre faixa clara | `rgb(43,45,47)` (o branco vaza no alpha 85%) | `rgb(23,26,30)`                  |
| assentado na seção escura     | `rgb(43,45,47)`                              | `rgb(11,14,18)` = a cor da folha |

O alpha do vidro escuro é maior de propósito (95% contra 85% do claro): sobre a folha clara, um
`void-900` a 85% lê como cinza (`rgb(48,50,53)`) até a folha escura cobrir a faixa. Com o menu mobile aberto o cabeçalho acompanha o painel claro
(`bg-white/85`). Validado no navegador medindo `background-color`, `backdrop-filter`,
`transition-property` e o contraste composto em cada quadro da travessia.

### 7.5 Hero

Continua com o recuo (`copyY = -60px`) e o desbotamento (`copyOpacity`) do texto, agora com o
progresso vindo do **retângulo real da folha seguinte** (0 quando ela aparece na base da janela, 1
quando termina de cobrir) — o retângulo do próprio hero não se move enquanto ele está preso. No
mobile a coluna abre pelo cubo, depois o `h1` e o resto do texto (`order` só no mobile; a partir de
`lg` vale a ordem do documento).

### 7.6 Qualidade

12 arquivos de teste / 70 casos verdes, com `typecheck`, `lint` e `prettier` limpos. Novos testes:
`sections.test.ts` (ordem, alternância de tons, pele do cabeçalho, paridade das chaves i18n),
`Stack.test.tsx` (prende folha curta, trava folha alta, `z-index`, marcadores de tom e pele, âncora
externa, camada de fundo, movimento reduzido), `useSectionTheme.test.tsx` (folha sob a linha, tema
inicial e troca no scroll), `Navbar.test.tsx` (menu, as três peles e uma trava de regressão: o
cabeçalho não pode voltar a animar cores) e `Footer.test.tsx` (assinatura, canais e reabertura do
consentimento).

---

## 8. Cabeçalho em caixa, folha `fullBleed` e carrossel de passos

Sessão posterior: o cabeçalho compartilhado de `Section` deixou de ser uma **régua fina** e virou uma
**caixa** (`Card`), o vão até o conteúdo encolheu, e a seção **02 — Como funciona** trocou a timeline
numerada por um **carrossel de vídeos** em tela cheia dirigido pelo scroll.

### 8.1 Cabeçalho em caixa (`src/components/ui/Section.tsx`)

O bloco `NN / RÓTULO` + título + subtítulo passou a viver dentro do `Card` — o mesmo primitivo de
superfície que o Overview já usava (`rounded-2xl border border-ink-200/70 bg-surface shadow-card`).
Nenhuma superfície nova foi criada: a moldura é a mesma dos demais cards da página.

|                          | Antes                                                  | Depois                                      |
| :----------------------- | :----------------------------------------------------- | :------------------------------------------ |
| Moldura do cabeçalho     | `<Reveal className="border-t border-ink-200/80 pt-7">` | `<Card as="header" className="p-6 sm:p-8">` |
| Filete                   | régua superior no `Reveal`                             | borda do próprio `Card` + `shadow-card`     |
| Vão cabeçalho → conteúdo | `mt-12 lg:mt-16`                                       | `mt-6 lg:mt-8`                              |

`as="header"` mantém a semântica de documento: a caixa **é** o `<header>` da `<section>`, e o
`aria-labelledby` continua no `Stack` apontando para o `h2` de dentro dela. O `text-center
lg:text-left` do `Reveal` foi preservado.

### 8.2 Folha `fullBleed` (`Section` → `HowItWorks`)

O carrossel precisa de `100vw` por painel, então `Section` ganhou a prop `fullBleed?: boolean`
(padrão `false`): com ela, os filhos são renderizados **fora** da coluna `max-w-6xl`.

O ajuste fino foi no respiro. Como em `fullBleed` o container abriga **só o cabeçalho**, o
`lg:py-28` do container somava ao `mt` do conteúdo e abria um vão de ~144px — o **dobro** das outras
seções. O padding do container passou a ser condicional:

| Folha       | Padding do container        | Vão até o conteúdo |
| :---------- | :-------------------------- | :----------------- |
| comum       | `py-20 lg:py-28`            | `mt-6 lg:mt-8`     |
| `fullBleed` | `pt-20 lg:pt-28` (sem `pb`) | `mt-6 lg:mt-8`     |

Em `fullBleed` quem fornece o respiro inferior é o próprio conteúdo: o `HowItWorks` fecha a seção
com a nota do `humanNote` em `pb-24 lg:pb-28`.

### 8.3 Carrossel de passos (`HowItWorks.tsx` + `StepCarousel.tsx` + `assets/videos/`)

A timeline vertical (linha de progresso + bolinhas `01`–`05` + quadros de captura reservados) foi
substituída por um carrossel horizontal: cada passo é um painel de tela cheia com o **vídeo da
demonstração** ao lado do rótulo, do título e do texto.

Mecânica (`src/components/ui/StepCarousel.tsx`):

- A seção gasta altura no eixo vertical (`h-[500vh]`) e um viewport `sticky top-0` prende na tela;
  o trilho desliza em `x` de `0vw` a `-400vw` conforme o scroll (`count - 1` painéis).
- O **mesmo progresso** (com mola, `stiffness 140 / damping 30 / mass 0.5`) "scrubba" os vídeos:
  `currentTime = clamp((count - 1) * progresso - índice + 1, 0, 1) * duração`. Deslize e vídeo ficam
  em sincronia e **reversíveis** no scroll. O `useMotionValueEvent` só escreve quando a diferença
  passa de 30ms, para não brigar com o decoder.
- Uma barra de progresso (`scaleX`) na base da tela dá a posição do carrossel.
- **Movimento reduzido:** `useReducedMotion()` troca tudo por uma lista com `snap-x` em
  `overflow-x-auto` e desliga o scrub — os vídeos ficam no primeiro quadro, sem animação dirigida.

Mídia: `src/assets/videos/Step_1..5.mp4` — 5 arquivos, ≈3,9 MB no total, 5,0–7,0 s cada. São
importados pelo Vite e servidos com hash (`dist/assets/Step_1-BW3rEBbe.mp4`, …). O texto ao lado é
traduzido com a página, mas os vídeos são únicos e **mudos, sem legendas**.

### 8.4 Texto da origem científica

`research.body1` (pt-BR e EN) passou a nomear o trabalho como **estudo de caso acadêmico**, com o
título entre aspas, e a descrever o gargalo como a lista conferida no galpão transcrita para o
Atende.net. As chaves seguem em paridade 1:1 nos dois locales (154 chaves cada).

### 8.5 Qualidade

| Etapa      | Comando                  | Resultado                                               |
| :--------- | :----------------------- | :------------------------------------------------------ |
| Testes     | `npm test`               | ✅ 13 arquivos · **78/78**                              |
| Typecheck  | `npm run typecheck`      | ✅ 0 erros                                              |
| Lint       | `npm run lint`           | ✅ 0 problemas                                          |
| Formatação | `npx prettier --check .` | ✅ limpo                                                |
| Build      | `npm run build`          | ✅ ~570ms, com os 5 `.mp4` publicados em `dist/assets/` |

Validação em navegador real (1440×900):

| Medida                                | Resultado                                                                   |
| :------------------------------------ | :-------------------------------------------------------------------------- |
| Cabeçalho das 6 seções                | `<header>` semântico, `border-radius: 16px`, `padding: 32px`, `shadow-card` |
| Fundo da caixa (folha clara / escura) | `rgb(255,255,255)` / `rgb(18,22,27)`                                        |
| Vão cabeçalho → conteúdo              | `32px` em `lg` (e `24px` abaixo do breakpoint)                              |
| Carrossel                             | 5 painéis, 5 vídeos (`readyState 4`, 5,0–7,0 s), wrapper de `500vh`         |
| Scrub no meio da seção                | `[5,07 · 6,96 · 6,93 · 2,48 · 0]` s — um painel por vez                     |

### 8.6 Pendências atualizadas (ver seção 5)

| #   | Pendência original                                     | Situação                                                                      |
| :-- | :----------------------------------------------------- | :---------------------------------------------------------------------------- |
| 1   | Publicar os instaladores no repositório de releases    | ✅ resolvida — `v1.2.0` publicada; o CI builda com `VITE_RELEASES_READY=true` |
| 2   | Definir `VITE_GA_ID`                                   | ⏳ aberta — segue opcional e inerte                                           |
| 3   | Fornecer as capturas de tela dos 5 passos              | ✅ resolvida — o autor entregou os **vídeos**, que substituíram os quadros    |
| 4   | Definir o domínio final e ajustar `og:image` / JSON-LD | ✅ resolvida — URL absoluta de `vitorrosadev.github.io/transfertool`          |
| 5   | Executar o deploy no Hostinger hPanel                  | ➖ superada — a publicação é GitHub Pages via Actions (`README.md`)           |

Fica em aberto, para quem voltar a mexer no carrossel: **nenhum teste cobre `StepCarousel.tsx`** —
o controle por scroll, o scrub e o caminho de `prefers-reduced-motion` foram validados apenas em
navegador.
