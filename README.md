# Boilerplate Next.js - Template Acelerador de Projetos

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fluizfilipeschaeffer%2Fboilerplate-login)

**Link do Projeto:** [https://boilerplate-login.vercel.app/](https://boilerplate-login.vercel.app/)

Este é um template de projeto Next.js robusto, projetado para servir como uma base sólida e escalável para futuras aplicações web. O objetivo é eliminar o trabalho repetitivo de configuração inicial e fornecer um conjunto de funcionalidades essenciais prontas para uso.

## ✨ Recursos Inclusos

-   **Framework Moderno:** Construído com [Next.js](https://nextjs.org/) (App Router) e [React](https://react.dev/).
-   **Tipagem Estática:** [TypeScript](https://www.typescriptlang.org/) em todo o projeto.
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) para uma UI utilitária e customizável.
-   **Componentes de UI:** Utiliza [shadcn/ui](https://ui.shadcn.com/) como base para componentes acessíveis.
-   **Backend Integrado:** Lógica de backend construída diretamente com API Routes do Next.js.
-   **Autenticação Completa:** Fluxos de registro, login, logout, edição de perfil e redefinição de senha.
-   **Upload de Arquivos:** Exemplo de upload de imagem de perfil com [Vercel Blob](https://vercel.com/storage/blob).
-   **Sistema de Backup Avançado:** Backup manual e automático do banco de dados com compatibilidade multiplataforma (Windows/Linux/macOS) e suporte a ambientes de produção (Vercel + Render).
-   **Sistema de Permissões:** Verificação de roles de usuário (admin/user) para funcionalidades administrativas.
-   **Qualidade de Código:** [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/) configurados para garantir a consistência do código.
-   **Migrações de Banco de Dados:** Sistema simples de migração com scripts SQL e `ts-node`.

## 🚀 Começando

### Pré-requisitos

-   [Node.js](https://nodejs.org/en) (versão 20.x ou superior)
-   [pnpm](https://pnpm.io/) como gerenciador de pacotes.
-   **Para backup local:** [PostgreSQL](https://www.postgresql.org/) instalado (opcional, apenas para desenvolvimento)

### 1. Configuração do Ambiente

1.  Clone o repositório:
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO] nome-do-projeto
    cd nome-do-projeto
    ```

2.  Instale as dependências:
    ```bash
    pnpm install
    ```

3.  Configure suas variáveis de ambiente. Renomeie o arquivo `.env.example` (se houver) para `.env` e preencha com suas credenciais, especialmente a `POSTGRES_URL`.
    ```
    # Exemplo de .env
    POSTGRES_URL="postgres://user:password@host:port/database"
    JWT_SECRET="seu-segredo-super-secreto-para-jwt"
    RESEND_API_KEY="sua-chave-do-resend"
    BACKUP_EMAIL="admin@exemplo.com"
    # ... outras variáveis para Vercel Blob, etc.
    ```

### 2. Configuração do Banco de Dados

Este projeto usa um sistema de migração simples para versionar o schema do banco de dados.

1.  Crie seus scripts de migração na pasta `/migrations` (ex: `migrations/YYYY-MM-DD-nome-da-migracao.sql`).
2.  Execute as migrações:
    ```bash
    pnpm db:migrate
    ```

### 3. Configuração de Administrador

Para usar funcionalidades administrativas (como backup), você precisa definir um usuário como administrador:

```bash
pnpm run set-admin <email-do-usuario>
```

Exemplo:
```bash
pnpm run set-admin admin@exemplo.com
```

### 4. Rodando o Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento, rode:

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 🛠️ Scripts Disponíveis

-   `pnpm dev`: Inicia o servidor de desenvolvimento.
-   `pnpm build`: Gera a build de produção do projeto.
-   `pnpm start`: Inicia um servidor de produção.
-   `pnpm lint`: Executa o ESLint para encontrar problemas no código.
-   `pnpm lint:fix`: Tenta corrigir os problemas encontrados pelo ESLint.
-   `pnpm format`: Formata todo o código com o Prettier.
-   `pnpm db:migrate`: Executa as migrações do banco de dados.
-   `pnpm set-admin <email>`: Define um usuário como administrador.
-   `pnpm backup:auto`: Executa backup automático (se habilitado).

## 📂 Estrutura de Pastas

O código-fonte da aplicação reside no diretório `src/`:

-   `src/app`: Rotas, páginas e layouts (App Router).
-   `src/components`: Componentes React reutilizáveis.
-   `src/lib`: Funções utilitárias e helpers.
-   `src/hooks`: Hooks React customizados.
-   `migrations/`: Scripts de migração do banco de dados.
-   `memory-bank/`: Documentação interna do projeto (ver abaixo).

## 🧠 Memory Bank

Este projeto utiliza um sistema de documentação interna chamado "Memory Bank", localizado na pasta `/memory-bank`. Ele serve como uma fonte de verdade sobre as decisões de arquitetura, produto e tecnologia, garantindo que o conhecimento do projeto seja preservado.

## 🔒 Sistema de Backup Avançado

O projeto inclui um sistema completo de backup com compatibilidade multiplataforma e suporte a ambientes de produção.

### 🎯 Características Principais

- **Compatibilidade Multiplataforma:** Funciona em Windows, Linux e macOS
- **Suporte a Produção:** Compatível com Vercel + Render.com
- **Detecção Automática:** Escolhe automaticamente o método de backup baseado no ambiente
- **Backup Manual e Automático:** Interface administrativa para controle total
- **Envio por E-mail:** Integração com Resend para backup automático

### 🔧 Como Funciona

O sistema detecta automaticamente o ambiente e escolhe o método de backup apropriado:

#### 🖥️ **Desenvolvimento Local**
- Usa `pg_dump` para gerar backup completo
- Suporte nativo para Windows (PowerShell), Linux e macOS
- Backup salvo localmente em arquivo `.sql`

#### ☁️ **Produção (Vercel + Render)**
- Gera backup via SQL puro (sem dependência do `pg_dump`)
- Compatível com ambientes serverless
- Backup retornado diretamente como download

### 📋 Backup Manual

1. **Acesse a interface administrativa:**
   - Vá para `/dashboard/settings` (apenas administradores)
   - Clique em "Executar backup manualmente"
   - O arquivo SQL será baixado automaticamente

2. **Via API (para desenvolvedores):**
   ```bash
   curl -X POST http://localhost:3000/api/backup \
     -H "Cookie: auth_token=seu-token-jwt" \
     -o backup.sql
   ```

### 🤖 Backup Automático

1. **Configure o e-mail de destino:**
   ```env
   BACKUP_EMAIL="admin@exemplo.com"
   ```

2. **Habilite o backup automático:**
   ```sql
   UPDATE settings SET auto_backup_enabled = true WHERE id = 1;
   ```

3. **Execute o backup automático:**
   ```bash
   pnpm run backup:auto
   ```

### ⚙️ Configurações de Backup

- **Interface Web:** Acesse `/dashboard/settings` como administrador
- **Configurações Disponíveis:**
  - Habilitar/desabilitar backup automático
  - E-mail de destino para backup automático
- **Persistência:** Configurações salvas automaticamente no banco de dados

### 🛠️ Compatibilidade Windows

O sistema foi especialmente otimizado para Windows:

- **Detecção Automática:** Identifica automaticamente o sistema operacional
- **Caminho do PostgreSQL:** Usa caminho completo para `pg_dump.exe`
- **PowerShell:** Utiliza sintaxe correta do PowerShell para execução
- **Fallback SSL:** Múltiplas tentativas com diferentes configurações SSL

### 🚀 Deploy em Produção

Para usar em produção (Vercel + Render.com):

1. **Configure as variáveis de ambiente na Vercel:**
   ```
   POSTGRES_URL=sua-url-do-render
   JWT_SECRET=seu-segredo-jwt
   RESEND_API_KEY=sua-chave-resend
   BACKUP_EMAIL=admin@exemplo.com
   ```

2. **O sistema automaticamente:**
   - Detecta que está rodando na Vercel
   - Usa backup via SQL puro (sem `pg_dump`)
   - Funciona com banco remoto no Render.com

3. **Teste o backup em produção:**
   - Acesse `/dashboard/settings` como administrador
   - Execute backup manual
   - Verifique se o arquivo é baixado corretamente

### 🔍 Troubleshooting

#### Erro: `'PGSSLMODE' não é reconhecido como um comando interno`
- **Causa:** Comando não compatível com Windows
- **Solução:** Sistema já corrigido automaticamente

#### Erro: `pg_dump: command not found`
- **Causa:** PostgreSQL não instalado ou não no PATH
- **Solução:** Sistema detecta automaticamente e usa caminho completo

#### Backup não funciona em produção
- **Causa:** Ambiente não detectado corretamente
- **Solução:** Verifique se `NODE_ENV=production` e `VERCEL=1` estão setados

### 📊 Estrutura do Backup

O backup gerado inclui:

- **Tabela `users`:** Todos os usuários com roles e configurações
- **Tabela `settings`:** Configurações do sistema
- **Tabela `notifications`:** Notificações dos usuários
- **Tabela `invites`:** Convites pendentes
- **Tabela `migrations_log`:** Histórico de migrações (se existir)

### 🔐 Segurança

- **Autenticação Obrigatória:** Apenas usuários logados podem acessar
- **Verificação de Admin:** Apenas administradores podem executar backup
- **Dados Sensíveis:** Senhas são hasheadas, tokens são preservados
- **SSL:** Conexões seguras com banco de dados

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
