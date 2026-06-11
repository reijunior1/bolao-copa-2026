# ⚽ Bolão da Copa 2026 — Reinaldo, Fred, Rupinha, Gersinho e Otávio

Página única (`index.html`, sem build, sem dependências) para o bolão da galera
durante a Copa do Mundo 2026. Já vem com **os 72 jogos reais da fase de grupos**
embutidos; os jogos do mata-mata o admin cadastra pela própria página conforme
a Copa avança.

## Como funciona

- Cada amigo abre o link, toca no próprio nome e preenche os placares.
- O palpite de cada jogo **trava à meia-noite do dia do jogo** (horário de Brasília).
- O admin (você) lança os resultados oficiais na aba **⚙️ Resultados**
  (senha padrão: `taquion2026` — **troque** na constante `SENHA_ADMIN` do `index.html`).
- O ranking calcula sozinho: **5 pts** placar exato · **3 pts** vencedor + saldo ·
  **2 pts** só o vencedor/empate.
- **Gamificado**: níveis com XP (de 🪵 Perna de Pau a 🐐 GOAT Eterno), 7 conquistas
  desbloqueáveis, sequência de acertos com 🔥 e confete ao salvar palpites.
- **Feito pra celular**: no mobile a navegação vira uma barra fixa inferior estilo
  aplicativo, com botões grandes e suporte a notch/safe-area do iPhone.

## Passo 1 — Hospedar de graça

Qualquer hospedagem estática serve. As mais fáceis:

**Netlify Drop (mais rápido, sem conta git):**
1. Acesse <https://app.netlify.com/drop>
2. Arraste a pasta do projeto para a página
3. Pronto — ele te dá um link tipo `https://bolao-da-galera.netlify.app`

**GitHub Pages:**
1. Crie um repositório novo — este aqui! — e suba os arquivos
2. Em *Settings → Pages*, selecione a branch `main` e a pasta raiz
3. O link fica `https://SEU_USUARIO.github.io/bolao-copa-2026/`

Depois é só mandar o link no grupo do WhatsApp. 🎉

## Passo 2 — Supabase (recomendado!): palpites sincronizados entre todos

Sem este passo a página funciona, **mas cada um só vê os próprios palpites no
próprio celular** (modo local). Para todo mundo ver os palpites de todo mundo e
o ranking ao vivo, configure o Supabase (grátis, ~10 minutos):

> 💡 Crie um projeto **separado** só para o bolão — não use o projeto do
> ChatFlow, porque as tabelas do bolão ficam com escrita pública.

1. Acesse <https://supabase.com/dashboard> e crie um projeto novo
   (ex.: `bolao-copa-2026`), plano Free.
2. Abra o **SQL Editor**, cole o bloco abaixo e clique em **Run**:
   ```sql
   create table palpites (
     jogador text not null,
     jogo_id text not null,
     casa    smallint not null,
     fora    smallint not null,
     primary key (jogador, jogo_id)
   );

   create table resultados (
     jogo_id text primary key,
     casa    smallint not null,
     fora    smallint not null
   );

   create table jogos_extras (
     n      smallint primary key,
     fase   text not null,
     data   date not null,
     casa   text not null,
     fora   text not null,
     cidade text
   );

   -- acesso aberto (ok para um bolão entre amigos)
   alter table palpites     enable row level security;
   alter table resultados   enable row level security;
   alter table jogos_extras enable row level security;
   create policy "bolao aberto" on palpites     for all using (true) with check (true);
   create policy "bolao aberto" on resultados   for all using (true) with check (true);
   create policy "bolao aberto" on jogos_extras for all using (true) with check (true);

   -- atualização ao vivo na página
   alter publication supabase_realtime add table palpites, resultados, jogos_extras;
   ```
3. Vá em **Project Settings → API** e copie a **Project URL** e a chave
   **anon public**.
4. No `index.html`, substitua `const SUPABASE_CONFIG = null;` por:
   ```js
   const SUPABASE_CONFIG = {
     url: 'https://SEU-PROJETO.supabase.co',
     anonKey: 'eyJhbGciOi...',
   };
   ```
5. Hospede de novo (ou faça push). O aviso amarelo de "modo local" some e
   tudo passa a sincronizar em tempo real — cada palpite salvo aparece na
   hora no celular dos outros.

## Personalizar

Tudo fica no topo do `<script>` do `index.html`:

| O quê | Onde |
|---|---|
| Participantes (adicionar o 6º amigo!) | constante `JOGADORES` |
| Senha do admin | constante `SENHA_ADMIN` |
| Pontuação | constante `PONTOS` |
| Sincronização | constante `SUPABASE_CONFIG` |
| Níveis e conquistas | constantes `NIVEIS` e `CONQUISTAS` |

## Aviso

A senha de admin é uma trava de conveniência (está no código da página), não
segurança de verdade — para um bolão entre cinco amigos, resolve. Não use este
banco para nada além do bolão.
