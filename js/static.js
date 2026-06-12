// Dados estáticos: bandeiras, níveis e conquistas da gamificação.

// código ISO de cada seleção (imagens via flagcdn.com — emoji não renderiza no Windows)
export const BANDEIRAS = {
  'México': 'mx', 'África do Sul': 'za', 'Coreia do Sul': 'kr', 'Tchéquia': 'cz',
  'Canadá': 'ca', 'Bósnia e Herzegovina': 'ba', 'Catar': 'qa', 'Suíça': 'ch',
  'Brasil': 'br', 'Marrocos': 'ma', 'Haiti': 'ht', 'Escócia': 'gb-sct',
  'Estados Unidos': 'us', 'Paraguai': 'py', 'Austrália': 'au', 'Turquia': 'tr',
  'Alemanha': 'de', 'Curaçao': 'cw', 'Costa do Marfim': 'ci', 'Equador': 'ec',
  'Países Baixos': 'nl', 'Japão': 'jp', 'Suécia': 'se', 'Tunísia': 'tn',
  'Bélgica': 'be', 'Egito': 'eg', 'Irã': 'ir', 'Nova Zelândia': 'nz',
  'Espanha': 'es', 'Cabo Verde': 'cv', 'Arábia Saudita': 'sa', 'Uruguai': 'uy',
  'França': 'fr', 'Senegal': 'sn', 'Iraque': 'iq', 'Noruega': 'no',
  'Argentina': 'ar', 'Argélia': 'dz', 'Áustria': 'at', 'Jordânia': 'jo',
  'Portugal': 'pt', 'RD Congo': 'cd', 'Uzbequistão': 'uz', 'Colômbia': 'co',
  'Inglaterra': 'gb-eng', 'Croácia': 'hr', 'Gana': 'gh', 'Panamá': 'pa',
};

export const NIVEIS = [
  { min: 0,   titulo: 'Pé de Rato',        icone: '🐀' },
  { min: 8,   titulo: 'Boleiro de Várzea', icone: '🥾' },
  { min: 20,  titulo: 'Promessa da Base',  icone: '🌱' },
  { min: 40,  titulo: 'Farmando Aura',     icone: '✨' },
  { min: 70,  titulo: 'Camisa 10',         icone: '🔟' },
  { min: 110, titulo: 'Craque da Copa',    icone: '⭐' },
  { min: 160, titulo: 'GOAT Eterno',       icone: '🐐' },
];

export const CONQUISTAS = [
  { id: 'mosca',    icone: '🎯', nome: 'Na Mosca',    desc: 'Acerte 1 placar exato',           check: (s) => s.exatos >= 1 },
  { id: 'maedina',  icone: '🔮', nome: 'Mãe Diná',    desc: 'Acerte 3 placares exatos',        check: (s) => s.exatos >= 3 },
  { id: 'pequente', icone: '🔥', nome: 'Pé Quente',   desc: 'Pontue em 3 jogos seguidos',      check: (s) => s.melhorSequencia >= 3 },
  { id: 'insano',   icone: '🌋', nome: 'Modo Insano', desc: 'Pontue em 5 jogos seguidos',      check: (s) => s.melhorSequencia >= 5 },
  { id: 'assiduo',  icone: '📋', nome: 'Assíduo',     desc: 'Palpite em 20 jogos',             check: (s) => s.palpitesFeitos >= 20 },
  { id: 'maratona', icone: '🏃', nome: 'Maratonista', desc: 'Palpite nos 72 jogos dos grupos', check: (s) => s.palpitesGrupos >= 72 },
  { id: 'pefrio',   icone: '🥶', nome: 'Pé Frio',     desc: 'Zere 4 jogos seguidos (eita 😅)', check: (s) => s.piorSequencia >= 4 },
];

export const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
