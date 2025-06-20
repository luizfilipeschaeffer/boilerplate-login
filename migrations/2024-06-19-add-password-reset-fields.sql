-- Adiciona colunas para o fluxo de redefinição de senha
ALTER TABLE users
ADD COLUMN password_reset_token TEXT,
ADD COLUMN password_reset_token_expires TIMESTAMPTZ; 