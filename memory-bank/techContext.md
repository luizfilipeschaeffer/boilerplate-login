# Tech Context

## Stack Tecnológica

- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **UI:** shadcn/ui
- **Banco de Dados:** PostgreSQL (gerenciado via Vercel Postgres ou similar)
- **ORM:** node-postgres (pg)

## Gerenciamento de Pacotes

Para otimizar o gerenciamento de dependências e o uso de espaço em disco, este projeto adotará o **PNPM**. Ele é mais rápido e eficiente que o NPM e o Yarn clássicos.

## Arquitetura de Backend

Decidiu-se por **consolidar a lógica de backend dentro das API Routes do Next.js** (`src/app/api`). Esta abordagem oferece as seguintes vantagens:
- **Monorepo Simplificado:** Todo o código (frontend e backend) reside em um único repositório e projeto.
- **Desenvolvimento Unificado:** Tipos e interfaces podem ser compartilhados nativamente entre o cliente e o servidor.
- **Deploy Atômico:** O frontend e o backend são deployados juntos em uma única operação, garantindo consistência.

A pasta `backend/` existente será migrada para as API Routes e depois removida. 