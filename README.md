# Boilerplate Next.js + Express na Netlify

Este é um projeto que combina um frontend Next.js com um backend Express, deployado na Netlify e utilizando um banco de dados PostgreSQL externo.

## 📋 Pré-requisitos

- Node.js 18.14.0 ou superior
- Uma conta na [Netlify](https://www.netlify.com/)
- Um banco de dados PostgreSQL (recomendamos [Supabase](https://supabase.com/), [Railway](https://railway.app/), ou [Neon](https://neon.tech/))
- Uma conta de email SMTP (pode usar [SendGrid](https://sendgrid.com/), [Gmail](https://gmail.com), etc.)

## 🚀 Deploy na Netlify

### 1. Preparação do Repositório

1. Clone o repositório:
   ```bash
   git clone [URL_DO_SEU_REPOSITORIO]
   cd [NOME_DO_PROJETO]
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

### 2. Configuração do Banco de Dados

1. Crie um banco de dados PostgreSQL em um dos serviços sugeridos
2. Execute os scripts SQL necessários (encontrados em `/backend/sql/`)
3. Guarde a string de conexão do banco de dados

### 3. Configuração do SMTP

1. Configure uma conta de email SMTP
2. Guarde as credenciais de acesso SMTP:
   - Host do servidor SMTP
   - Porta SMTP
   - Usuário SMTP
   - Senha SMTP
   - Email remetente

### 4. Deploy na Netlify

1. Faça login na Netlify:
   ```bash
   npm install netlify-cli -g
   netlify login
   ```

2. Inicie o deploy:
   ```bash
   netlify init
   ```

3. Durante a configuração:
   - Escolha "Create & configure a new site"
   - Selecione o time (se tiver mais de um)
   - Escolha um nome para o site (ou deixe a Netlify gerar um)

### 5. Configuração das Variáveis de Ambiente

No painel da Netlify, vá em:
1. Site settings > Environment variables
2. Adicione as seguintes variáveis:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| DATABASE_URL | URL de conexão do PostgreSQL | postgres://user:pass@host:5432/dbname |
| JWT_SECRET | Chave secreta para tokens JWT | um-segredo-muito-seguro-123 |
| SMTP_HOST | Host do servidor SMTP | smtp.gmail.com |
| SMTP_PORT | Porta do servidor SMTP | 587 |
| SMTP_USER | Usuário SMTP | seu-email@gmail.com |
| SMTP_PASS | Senha SMTP | sua-senha-ou-app-password |
| SMTP_FROM | Email remetente | noreply@seudominio.com |
| FRONTEND_URL | URL do frontend | https://seu-site.netlify.app |

### 6. Configuração do Build

Verifique se o arquivo `netlify.toml` contém:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[functions]
  external_node_modules = ["express"]
  node_bundler = "esbuild"

[[redirects]]
  force = true
  from = "/api/*"
  status = 200
  to = "/.netlify/functions/api/:splat"
```

## 📝 Notas Importantes

### Limitações das Funções Serverless

- Tempo máximo de execução: 10 segundos
- Tamanho máximo do pacote: 50MB
- Memória limitada
- Conexões persistentes não são recomendadas

### Banco de Dados

- Use pools de conexão com limites adequados
- Configure SSL se necessário
- Mantenha índices apropriados para queries frequentes

### Segurança

- Sempre use HTTPS
- Mantenha o JWT_SECRET seguro e único
- Use senhas fortes para banco de dados e SMTP
- Configure CORS adequadamente se necessário

## 🔍 Verificação do Deploy

1. Teste o status do backend:
   ```
   curl https://seu-site.netlify.app/api/hello
   ```

2. Teste a conexão com o banco:
   ```
   curl https://seu-site.netlify.app/api/db-status
   ```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com o Banco:**
   - Verifique se a string de conexão está correta
   - Confirme se o IP do Netlify está liberado no banco
   - Verifique se SSL está configurado corretamente

2. **Erros de CORS:**
   - Verifique a configuração de CORS no arquivo `api.mjs`
   - Confirme se as origens permitidas estão corretas

3. **Problemas com Email:**
   - Verifique as credenciais SMTP
   - Confirme se a porta SMTP está correta
   - Para Gmail, use "App Password" se 2FA estiver ativo

4. **Funções Netlify não Funcionam:**
   - Verifique os logs na Netlify
   - Confirme se o arquivo `api.mjs` está no diretório correto
   - Verifique se todas as dependências estão instaladas

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs na Netlify
2. Consulte a [documentação da Netlify](https://docs.netlify.com/)
3. Verifique as [limitações das funções Netlify](https://docs.netlify.com/functions/overview/)

## 🔄 Atualizações

Para atualizar o deploy:
```bash
git push # Se configurou deploy automático
# ou
netlify deploy --prod # Para deploy manual
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
