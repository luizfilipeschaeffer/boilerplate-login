# System Patterns

## Arquitetura Geral

O projeto segue a arquitetura **App Router** do Next.js, que favorece o uso de **React Server Components (RSC)** por padrão.

- **Server Components:** São usados para buscar dados diretamente no servidor, acessar o backend (banco de dados, etc.) e renderizar conteúdo estático. A maioria dos componentes de página e layout devem ser Server Components.
- **Client Components:** Usados apenas quando há necessidade de interatividade no cliente (hooks como `useState`, `useEffect`, manipulação de eventos `onClick`, etc.). Para usar um Client Component, adicione a diretiva `"use client";` no topo do arquivo.

## Estrutura de Diretórios (Pós-refatoração)

Para uma melhor organização e escalabilidade, o código fonte da aplicação será centralizado em um diretório `src/`.

```
boilerplate-login/
├── src/
│   ├── app/                # Rotas, páginas e layouts (App Router)
│   │   ├── api/            # API Routes para o backend
│   │   └── (main)/         # Agrupamento de rotas principais
│   │       ├── dashboard/
│   │       └── ...
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── ui/             # Componentes de UI primitivos (shadcn/ui)
│   │   └── ...
│   ├── lib/                # Funções utilitárias, helpers
│   ├── hooks/              # Hooks React customizados
│   └── styles/             # Arquivos de estilo globais
├── public/                 # Arquivos estáticos
├── memory-bank/            # Documentação do projeto
├── package.json
└── ...
```

## Padrões de Componentes

- **Componentes de UI Primitivos:** Localizados em `src/components/ui`, são blocos de construção básicos (Button, Input, Card). Geralmente vêm de bibliotecas como `shadcn/ui`.
- **Componentes de Domínio:** Localizados diretamente em `src/components`, eles compõem os primitivos para criar funcionalidades específicas da aplicação (ex: `UserAvatar`, `LoginForm`). 