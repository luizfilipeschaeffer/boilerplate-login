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
-   **Qualidade de Código:** [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/) configurados para garantir a consistência do código.
-   **Migrações de Banco de Dados:** Sistema simples de migração com scripts SQL e `ts-node`.

## 🚀 Começando

### Pré-requisitos

-   [Node.js](https://nodejs.org/en) (versão 20.x ou superior)
-   [pnpm](https://pnpm.io/) como gerenciador de pacotes.

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
    # ... outras variáveis para Vercel Blob, etc.
    ```

### 2. Configuração do Banco de Dados

Este projeto usa um sistema de migração simples para versionar o schema do banco de dados.

1.  Crie seus scripts de migração na pasta `/migrations` (ex: `migrations/YYYY-MM-DD-nome-da-migracao.sql`).
2.  Execute as migrações:
    ```bash
    pnpm db:migrate
    ```

### 3. Rodando o Servidor de Desenvolvimento

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

## Backup Automático

1. Certifique-se de que a tabela `settings` existe (veja a migration em `migrations/2024-06-22-create-settings-table.sql`).
2. Defina a variável `BACKUP_EMAIL` no seu arquivo `.env` com o e-mail de destino.
3. Para habilitar o backup automático, defina o campo `auto_backup_enabled` como `true` na tabela `settings` (exemplo: `UPDATE settings SET auto_backup_enabled = true WHERE id = 1;`).
4. Execute o comando:

```bash
npm run backup:auto
```

Se a flag estiver ativada, o backup será gerado em `src/lib/backup/backup.sql` e enviado por e-mail usando o Resend.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
