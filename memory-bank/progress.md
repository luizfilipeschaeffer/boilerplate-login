# Progress

## O que Funciona (Estado Final)

-   **Autenticação:**
    -   Criação de conta de usuário com verificação por e-mail (simulada).
    -   Login e logout de usuário com JWT.
    -   Recuperação de senha por e-mail (token + página de redefinição).
-   **Gerenciamento de Usuário:**
    -   Edição de dados do perfil do usuário.
    -   Atualização de senha (estando logado).
    -   Upload e atualização da foto de perfil (via Vercel Blob).
-   **Dashboard:**
    -   Página de gerenciamento para listar todos os usuários.
    -   **Gerenciamento de Usuários (Dashboard):**
    -   Página para listar todos os usuários.
    -   Permissão para que um usuário possa excluir a própria conta.
    -   Permissão para excluir outros usuários controlada pela variável de ambiente `CAN_DELETE_OTHER_USERS`.

## O que Falta Construir (Backlog Sugerido)

-   **Sistema de Roles/Permissões (Avançado):** Implementar uma coluna `role` na tabela `users` (ex: `admin`, `user`) e proteger rotas de API com base nessa role.
-   **Envio Real de E-mails:** Substituir os `console.log` por um serviço de e-mail transacional real (ex: Resend, SendGrid).
-   **Testes:** Adicionar testes unitários e de integração (ex: com Jest e React Testing Library).

## Concluído

-   **Fase 1: Fundação e Criação do Memory Bank** - ✅
-   **Fase 2: Estruturação e Padronização do Projeto** - ✅
    -   [x] Adoção da estrutura `src/`.
    -   [x] Consolidação do backend nas API Routes.
    -   [x] Configuração de Prettier e ESLint.
-   **Fase 3: Implementação de Funcionalidades e Correções** - ✅
    -   [x] Correção do upload da foto de perfil.
    -   [x] Implementação do fluxo de recuperação de senha.
    -   [x] Criação da tela de listagem de usuários.
-   **Fase 4: Finalização e Documentação** - ✅
    -   **Fase 4: Implementação de Permissões** - ✅
    -   [x] Adicionada regra de negócio para exclusão de usuários.
    -   **Fase 5: Finalização e Documentação** - ✅
    -   [x] Atualização do `README.md`.
    -   [x] Revisão final do `memory-bank`. 