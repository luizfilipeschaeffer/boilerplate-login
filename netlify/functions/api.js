const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const router = express.Router();

// Configuração do CORS
app.use(cors());
app.use(express.json());

// Configuração do pool de conexão com o banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Rotas de autenticação
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    // Aqui você deve implementar a verificação da senha
    // usando bcrypt ou outro método seguro

    res.json({ message: 'Login realizado com sucesso' });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas de usuário
router.get('/user/profile', async (req, res) => {
  try {
    // Aqui você deve implementar a verificação do token
    const userId = req.headers.authorization;
    
    const result = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Outras rotas do seu backend aqui...

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app); 