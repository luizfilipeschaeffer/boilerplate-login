DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS friendship_status CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nickname TEXT NOT NULL UNIQUE,
    nome TEXT,
    sobrenome TEXT,
    email TEXT UNIQUE NOT NULL,
    email_recuperacao TEXT,
    telefone TEXT,
    cpf TEXT,
    birth_date DATE NOT NULL,
    password_hash TEXT NOT NULL,
    gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Usuário padrão para testes (senha: 123456, hash gerado com bcrypt)
INSERT INTO users (nickname, nome, sobrenome, email, email_recuperacao, telefone, cpf, birth_date, password_hash, gender)
VALUES (
  'usuario_teste',
  'Usuário',
  'Padrão',
  'teste@exemplo.com',
  'recupera@exemplo.com',
  '11999999999',
  '12345678900',
  '1990-01-01',
  '$2a$10$CwTycUXWue0Thq9StjUM0uJ8zQpQ1rQ1rQ1rQ1rQ1rQ1rQ1rQ1rQ1', -- hash de '123456'
  'masculino'
); 