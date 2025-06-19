-- Migration: Adiciona campos de verificação de conta na tabela users

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

-- Garante que a coluna profile_image existe (caso precise rodar junto com outras migrations)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);

-- Altera a coluna profile_image para BYTEA para armazenar imagem como BLOB
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='profile_image') THEN
    ALTER TABLE users ALTER COLUMN profile_image TYPE BYTEA USING decode(profile_image, 'base64');
  END IF;
END$$;