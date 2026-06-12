-- SQL para rodar no SQL Editor do Supabase (https://supabase.com)
-- Copie e cole todo o conteúdo abaixo e clique em RUN.

-- 1. Criar tabela de grupos
CREATE TABLE IF NOT EXISTS grupos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  criado_por uuid, -- Referência ao auth.users(id) se estiver usando Auth do Supabase
  premios jsonb DEFAULT '{"1": "Cerveja trincando", "2": "Refrigerante de 2L", "3": "Parabéns"}'::jsonb,
  codigo_convite text UNIQUE NOT NULL,
  criado_em timestamp with time zone DEFAULT now()
);

-- 2. Criar tabela de membros do grupo
CREATE TABLE IF NOT EXISTS grupo_membros (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  grupo_id uuid REFERENCES grupos(id) ON DELETE CASCADE,
  user_id uuid, -- Referência ao auth.users(id) ao logar com Google
  nome text NOT NULL,
  cor text NOT NULL DEFAULT '#4ce39a',
  role text NOT NULL DEFAULT 'membro', -- 'admin' ou 'membro'
  email text,
  UNIQUE (grupo_id, nome)
);

-- 3. Migrar tabela de palpites para suportar grupo_id
-- Remove a restrição antiga se ela existir
ALTER TABLE palpites ADD COLUMN IF NOT EXISTS grupo_id uuid REFERENCES grupos(id) ON DELETE CASCADE;

-- Se houver dados antigos sem grupo_id, podemos mantê-los ou recriar a chave.
-- Para atualizar a chave primária com segurança:
ALTER TABLE palpites DROP CONSTRAINT IF EXISTS palpites_pkey;
ALTER TABLE palpites ADD PRIMARY KEY (grupo_id, jogador, jogo_id);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupo_membros ENABLE ROW LEVEL SECURITY;

-- Políticas públicas temporárias para o bolão entre amigos (sem complicar RLS no momento)
DROP POLICY IF EXISTS "bolao aberto grupos" ON grupos;
CREATE POLICY "bolao aberto grupos" ON grupos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "bolao aberto membros" ON grupo_membros;
CREATE POLICY "bolao aberto membros" ON grupo_membros FOR ALL USING (true) WITH CHECK (true);

-- Ajustar política de palpites para permitir palpites por grupo
DROP POLICY IF EXISTS "bolao aberto" ON palpites;
CREATE POLICY "bolao aberto" ON palpites FOR ALL USING (true) WITH CHECK (true);

-- Habilitar replicação em tempo real para as novas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE grupos, grupo_membros;
