-- Adicionar coluna role na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Criar índice para melhor performance em consultas por role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Comentário sobre os valores possíveis
COMMENT ON COLUMN users.role IS 'Role do usuário: admin, user'; 