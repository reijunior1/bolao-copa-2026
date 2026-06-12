// Edge Function: busca placares da Copa 2026 na football-data.org
// e atualiza a tabela `resultados` no Supabase automaticamente.
//
// Deploy: supabase functions deploy atualizar-placares
// Agendar: Supabase → Edge Functions → atualizar-placares → Schedule → */5 * * * *

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const COMPETICAO_ID = 2000; // FIFA World Cup na football-data.org
// O ID 2000 é o código da Copa do Mundo. Pode precisar ajustar para 2026
// se a API ainda não tiver esse ID disponível.

// Mapeamento: nome na football-data.org → nome no bolão
const NOME_TIME: Record<string, string> = {
  'Mexico':                  'México',
  'South Africa':            'África do Sul',
  'Korea Republic':          'Coreia do Sul',
  'Czech Republic':          'Tchéquia',
  'Czechia':                 'Tchéquia',
  'Canada':                  'Canadá',
  'Bosnia and Herzegovina':  'Bósnia e Herzegovina',
  'Qatar':                   'Catar',
  'Switzerland':             'Suíça',
  'Brazil':                  'Brasil',
  'Morocco':                 'Marrocos',
  'Haiti':                   'Haiti',
  'Scotland':                'Escócia',
  'United States':           'Estados Unidos',
  'USA':                     'Estados Unidos',
  'Paraguay':                'Paraguai',
  'Australia':               'Austrália',
  'Turkey':                  'Turquia',
  'Germany':                 'Alemanha',
  'Curacao':                 'Curaçao',
  'Curaçao':                 'Curaçao',
  'Ivory Coast':             'Costa do Marfim',
  "Côte d'Ivoire":           'Costa do Marfim',
  'Ecuador':                 'Equador',
  'Netherlands':             'Países Baixos',
  'Japan':                   'Japão',
  'Sweden':                  'Suécia',
  'Tunisia':                 'Tunísia',
  'Belgium':                 'Bélgica',
  'Egypt':                   'Egito',
  'Iran':                    'Irã',
  'New Zealand':             'Nova Zelândia',
  'Spain':                   'Espanha',
  'Cape Verde':              'Cabo Verde',
  'Saudi Arabia':            'Arábia Saudita',
  'Uruguay':                 'Uruguai',
  'France':                  'França',
  'Senegal':                 'Senegal',
  'Iraq':                    'Iraque',
  'Norway':                  'Noruega',
  'Argentina':               'Argentina',
  'Algeria':                 'Argélia',
  'Austria':                 'Áustria',
  'Jordan':                  'Jordânia',
  'Portugal':                'Portugal',
  'DR Congo':                'RD Congo',
  'Uzbekistan':              'Uzbequistão',
  'Colombia':                'Colômbia',
  'England':                 'Inglaterra',
  'Croatia':                 'Croácia',
  'Ghana':                   'Gana',
  'Panama':                  'Panamá',
};

function normalizarTime(nome: string): string {
  return NOME_TIME[nome] ?? nome;
}

Deno.serve(async () => {
  const FOOTBALL_TOKEN = Deno.env.get('FOOTBALL_DATA_TOKEN');
  const SUPABASE_URL   = Deno.env.get('SUPABASE_URL');
  const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!FOOTBALL_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ erro: 'Variáveis de ambiente não configuradas' }), { status: 500 });
  }

  // 1. Busca partidas já encerradas na football-data.org
  const resposta = await fetch(
    `https://api.football-data.org/v4/competitions/${COMPETICAO_ID}/matches?status=FINISHED`,
    { headers: { 'X-Auth-Token': FOOTBALL_TOKEN } }
  );

  if (!resposta.ok) {
    const texto = await resposta.text();
    return new Response(JSON.stringify({ erro: 'Falha na football-data.org', detalhe: texto }), { status: 502 });
  }

  const { matches } = await resposta.json() as { matches: Match[] };

  // 2. Monta os registros para upsert na tabela `resultados`
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const linhas = [];

  for (const m of matches) {
    if (!m.score?.fullTime?.home && m.score?.fullTime?.home !== 0) continue; // sem placar ainda

    const casaNome = normalizarTime(m.homeTeam.name);
    const foraNome = normalizarTime(m.awayTeam.name);

    // Descobre o número do jogo pelo confronto (busca nos dados do bolão)
    // Como a Edge Function não tem acesso direto ao DADOS_COPA,
    // usamos homeTeam + awayTeam como chave alternativa
    // O jogo_id será "ext:{homeTeam}:{awayTeam}" para partidas não encontradas por número
    const jogoId = `g:${casaNome}:${foraNome}`;

    linhas.push({
      jogo_id: jogoId,
      casa: m.score.fullTime.home,
      fora: m.score.fullTime.away,
    });
  }

  if (!linhas.length) {
    return new Response(JSON.stringify({ ok: true, atualizados: 0, msg: 'Nenhum jogo encerrado ainda.' }));
  }

  // 3. Upsert no Supabase
  const { error, count } = await sb
    .from('resultados')
    .upsert(linhas, { onConflict: 'jogo_id' });

  if (error) {
    return new Response(JSON.stringify({ erro: 'Falha ao salvar no Supabase', detalhe: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, atualizados: linhas.length }));
});

// Tipos auxiliares
interface Match {
  matchday: number;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}
