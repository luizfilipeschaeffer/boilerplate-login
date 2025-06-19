import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { pool } from './db.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import multer from 'multer';
import sharp from 'sharp';

console.log('DEBUG DATABASE_URL (server.js):', process.env.DATABASE_URL);

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do multer para armazenar em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máx
});

app.get('/', (req, res) => {
    res.send('API de autenticação está funcionando!');
});

// Função de validação de telefone internacional
function validarTelefoneInternacional(telefone) {
    // Aceita formatos como: +55 11 91234-5678
    const regex = /^\+[1-9]{1}[0-9]{0,2} \d{2} \d{4,5}-\d{4}$/;
    return regex.test(telefone);
}

// Função para enviar e-mail de verificação
async function sendVerificationEmail(to, token) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true para 465, false para outras
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`;
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject: 'Verifique sua conta',
        html: `<p>Olá!<br>Para ativar sua conta, clique no link abaixo:<br><a href="${verifyUrl}">${verifyUrl}</a></p>`
    });
}

app.post('/api/register', async (req, res) => {
    const { nickname, email, password, birth_date, gender, nome, sobrenome, telefone, email_recuperacao, cpf, profile_image } = req.body;

    // Validação: email de recuperação diferente do principal
    if (email_recuperacao && email_recuperacao === email) {
        return res.status(400).json({ message: 'O email de recuperação deve ser diferente do email principal.' });
    }
    // Validação: telefone internacional
    if (telefone && !validarTelefoneInternacional(telefone)) {
        return res.status(400).json({ message: 'Telefone deve estar no formato internacional. Ex: +55 11 91234-5678' });
    }

    try {
        // Verificar se o usuário já existe
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Usuário com este e-mail já existe.' });
        }

        // Hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tratar birth_date vazio
        const birthDateToInsert = birth_date === "" ? null : birth_date;

        // Gerar token de verificação
        const verification_token = crypto.randomBytes(32).toString('hex');
        const verification_token_expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

        // Inserir novo usuário no banco de dados
        const newUser = await pool.query(
            'INSERT INTO users(nickname, email, password_hash, birth_date, gender, nome, sobrenome, telefone, email_recuperacao, cpf, profile_image, is_verified, verification_token, verification_token_expires) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id, nickname, email, birth_date, gender, nome, sobrenome, telefone, email_recuperacao, cpf, profile_image, created_at, is_verified',
            [nickname, email, hashedPassword, birthDateToInsert, gender, nome, sobrenome, telefone, email_recuperacao, cpf, profile_image || null, false, verification_token, verification_token_expires]
        );

        const user = newUser.rows[0];

        // Enviar e-mail de verificação
        await sendVerificationEmail(email, verification_token);

        res.status(201).json({ message: 'Usuário registrado com sucesso! Verifique seu e-mail para ativar a conta.', user });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar se o usuário existe
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length === 0) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        const user = userExists.rows[0];

        // Comparar senha
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // Verificar se a conta está verificada
        if (!user.is_verified) {
            return res.status(403).json({ message: 'Conta não verificada. Verifique seu e-mail.' });
        }

        // Gerar JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login bem-sucedido!', token, user: { id: user.id, nickname: user.nickname, email: user.email, birth_date: user.birth_date, gender: user.gender, created_at: user.created_at } });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

app.get('/api/db-status', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Erro ao verificar status do banco:', error);
        res.status(500).json({ status: 'error', message: 'Banco de dados inacessível.' });
    }
});

// Middleware para autenticação JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token não fornecido.' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token inválido.' });
        req.userId = decoded.id;
        next();
    });
}

// Rota para buscar perfil do usuário autenticado
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nickname, nome, sobrenome, email, email_recuperacao, telefone, cpf, birth_date, gender, profile_image, created_at FROM users WHERE id = $1', [req.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para atualizar perfil do usuário autenticado
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const { nickname, nome, sobrenome, email_recuperacao, telefone, cpf, birth_date, gender, profile_image } = req.body;

    // Validação: email de recuperação diferente do principal
    if (email_recuperacao && email_recuperacao === req.userEmail) {
        return res.status(400).json({ message: 'O email de recuperação deve ser diferente do email principal.' });
    }
    // Validação: telefone internacional
    if (telefone && !validarTelefoneInternacional(telefone)) {
        return res.status(400).json({ message: 'Telefone deve estar no formato internacional. Ex: +55 11 91234-5678' });
    }

    try {
        // Buscar email principal do usuário
        const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [req.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const email = userResult.rows[0].email;
        if (email_recuperacao && email_recuperacao === email) {
            return res.status(400).json({ message: 'O email de recuperação deve ser diferente do email principal.' });
        }
        // Atualizar dados
        await pool.query(
            `UPDATE users SET
                nickname = $1,
                nome = $2,
                sobrenome = $3,
                email_recuperacao = $4,
                telefone = $5,
                cpf = $6,
                birth_date = $7,
                gender = $8,
                profile_image = $9,
                updated_at = NOW()
            WHERE id = $10`,
            [nickname, nome, sobrenome, email_recuperacao, telefone, cpf, birth_date, gender, profile_image || null, req.userId]
        );
        res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para atualizar senha do usuário autenticado
app.put('/api/user/password', authenticateToken, async (req, res) => {
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) {
        return res.status(400).json({ message: 'Preencha todos os campos.' });
    }
    try {
        // Buscar usuário
        const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        const user = userResult.rows[0];
        // Validar senha atual
        const isMatch = await bcrypt.compare(senha_atual, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Senha atual incorreta.' });
        }
        // Atualizar para nova senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nova_senha, salt);
        await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, req.userId]);
        res.status(200).json({ message: 'Senha atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Endpoint para verificar conta
app.get('/api/verify', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token não fornecido.' });
    try {
        const result = await pool.query('SELECT id, verification_token_expires FROM users WHERE verification_token = $1', [token]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Token inválido.' });
        }
        const user = result.rows[0];
        if (user.verification_token_expires && new Date(user.verification_token_expires) < new Date()) {
            return res.status(400).json({ message: 'Token expirado.' });
        }
        await pool.query('UPDATE users SET is_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1', [user.id]);
        res.status(200).json({ message: 'Conta verificada com sucesso!' });
    } catch (error) {
        console.error('Erro ao verificar conta:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// Rota para upload de imagem de perfil
app.put('/api/user/profile/image', authenticateToken, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
  }
  try {
    // Valida e redimensiona a imagem se necessário
    let image = sharp(req.file.buffer);
    const metadata = await image.metadata();
    let bufferToSave;
    if (metadata.width > 1000 || metadata.height > 1000) {
      image = image.resize({ width: 1000, height: 1000, fit: 'inside' });
      bufferToSave = await image.png().toBuffer();
    } else {
      bufferToSave = await image.png().toBuffer();
    }
    // Salva o buffer da imagem no banco
    await pool.query('UPDATE users SET profile_image = $1, updated_at = NOW() WHERE id = $2', [bufferToSave, req.userId]);
    res.status(200).json({ message: 'Imagem de perfil atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar imagem de perfil:', error);
    res.status(500).json({ message: 'Erro ao salvar imagem de perfil.' });
  }
});

// Rota para buscar imagem de perfil
app.get('/api/user/profile/image', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT profile_image FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0 || !result.rows[0].profile_image) {
      return res.status(404).json({ message: 'Imagem não encontrada.' });
    }
    res.set('Content-Type', 'image/png');
    res.send(result.rows[0].profile_image);
  } catch (error) {
    console.error('Erro ao buscar imagem de perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar imagem de perfil.' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor de autenticação rodando na porta ${PORT}`);
});