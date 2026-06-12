# Plano de Ação — Migração do Bolão da Copa 2026 para a infra Taquion

> **Decisões já tomadas:** Next.js + TypeScript (padrão ChatFlow/Taquion) · PWA para mobile · Supabase mantido como backend (Postgres + Realtime + Edge Functions).

## Situação atual

O projeto hoje é uma página única (`index.html` com ~3.600 linhas) com HTML, CSS e JavaScript embutidos, hospedada como site estático (GitHub Pages). Os dados ficam no Supabase (tabelas `palpites`, `resultados`, `jogos_extras`) com políticas RLS abertas, e uma Edge Function (`atualizar-placares`) busca placares na football-data.org a cada 5 minutos. A "autenticação" é escolher o próprio nome na tela e a senha de admin está hardcoded no HTML.

## Objetivo

Reescrever como aplicação **Next.js + TypeScript** (App Router, Tailwind CSS), responsiva e instalável como **PWA**, consumindo o Supabase (dados + tempo real) e a API de placares, hospedada na infraestrutura da Taquion — seguindo os mesmos padrões de projeto do ChatFlow.

---

## Fase 1 — Fundação do projeto (1–2 dias)

1. Criar o projeto Next.js 15 + TypeScript + Tailwind no próprio repositório (substituindo o site estático), com ESLint/Prettier alinhados ao ChatFlow.
2. Estrutura de pastas no padrão dos projetos Taquion:
   - `src/app/` — rotas (App Router)
   - `src/components/` — componentes de UI
   - `src/lib/supabase/` — clientes Supabase (browser e server)
   - `src/lib/` — regras de pontuação, níveis, conquistas
   - `src/data/` — os 72 jogos da fase de grupos (hoje embutidos no HTML)
   - `supabase/` — migrations e Edge Functions (já existem, permanecem)
3. Variáveis de ambiente (`.env.local` / secrets da infra): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — fim das credenciais hardcoded no HTML.
4. Tipos TypeScript gerados do schema do Supabase (`supabase gen types`).

## Fase 2 — Extração do domínio (1–2 dias)

1. Portar do `index.html` para módulos TypeScript puros (testáveis):
   - Tabela dos 72 jogos (`src/data/jogos.ts`)
   - Cálculo de pontos (`PONTOS`: 5 exato / 3 saldo / 2 vencedor)
   - Ranking, XP, níveis (`NIVEIS`) e conquistas (`CONQUISTAS`)
   - Regra de travamento de palpite (meia-noite do dia do jogo, fuso de Brasília, tolerância de 5 min)
2. Testes unitários (Vitest) para pontuação e travamento — são as regras que geram discussão no grupo, precisam estar certas.

## Fase 3 — Telas (3–5 dias)

Reproduzir as 4 abas atuais como rotas/componentes, mobile-first:

| Aba atual | Nova rota | Observações |
|---|---|---|
| Palpites | `/` | formulário de placares, rascunho local, confete ao salvar |
| Ranking | `/ranking` | pontos, XP, níveis, conquistas, sequência 🔥 |
| Resultados (admin) | `/admin` | lançar resultados, cadastrar jogos do mata-mata, promover admin |
| Regras | `/regras` | conteúdo estático |

- Barra de navegação inferior fixa no mobile (como hoje), sidebar/topbar no desktop.
- Componentes de UI seguindo o design system do ChatFlow (cores, espaçamentos, tipografia).

## Fase 4 — Dados e tempo real (2–3 dias)

1. Cliente Supabase com `@supabase/supabase-js` + assinaturas Realtime nas tabelas `palpites`, `resultados` e `jogos_extras` — ranking e placares atualizam ao vivo na tela de todos.
2. **Endurecer a segurança** (hoje a escrita é pública e a senha de admin está no código):
   - Supabase Auth (magic link por e-mail ou login simples) no lugar de "tocar no nome"
   - RLS de verdade: cada usuário só escreve os próprios palpites; só admin escreve em `resultados`/`jogos_extras`
   - Papel de admin em tabela `perfis`, não em senha no front
3. Manter e revisar a Edge Function `atualizar-placares` (football-data.org, cron */5 min); corrigir o mapeamento `jogo_id` para casar com os jogos do bolão.

## Fase 5 — PWA (1 dia)

1. Web App Manifest (ícone, nome, cor, instalável na tela inicial de Android/iPhone).
2. Service worker (`next-pwa` ou Serwist): cache do shell, funcionamento offline básico, atualização automática.
3. Opcional: Web Push para avisar "jogo começa em 1h, faltam seus palpites".

## Fase 6 — Deploy na infra Taquion (1 dia)

1. `Dockerfile` (build standalone do Next.js) + deploy no mesmo padrão do ChatFlow na infra Taquion.
2. CI no GitHub Actions: lint + testes + build a cada PR; deploy no merge para `main`.
3. Domínio/subdomínio (ex.: `bolao.taquion...`) com HTTPS — obrigatório para PWA e push.
4. Migração dos dados: o Supabase atual continua sendo a fonte; apenas rodar as novas migrations de auth/RLS. Janela de transição: publicar a nova URL no grupo e desativar o GitHub Pages.

## Fase 7 — Corte e acompanhamento (contínuo)

1. Teste com o grupo num jogo real (palpite → travamento → placar automático → ranking ao vivo).
2. Desativar a página antiga; README atualizado com o novo fluxo de desenvolvimento.

---

## Estimativa total

**~10 a 14 dias úteis** de trabalho, podendo paralelizar as fases 3 e 4.

## Riscos e pontos de atenção

- **Copa em andamento:** a migração de auth muda como os amigos entram — fazer entre rodadas e avisar o grupo.
- **football-data.org:** o ID da competição 2026 e os nomes dos times precisam de validação contra a API real (o mapeamento atual de `jogo_id` por nome é frágil).
- **Padrões do ChatFlow:** nesta sessão não foi possível ler o repositório `chatflow-ai`; antes da Fase 1, adicionar esse repo à sessão para copiar ESLint, estrutura e componentes reais em vez de aproximações.
