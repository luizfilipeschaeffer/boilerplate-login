# Guia de Configuração e Deploy para o Boilerplate Login

Este documento serve como um guia completo para configurar o ambiente de desenvolvimento, executar o projeto localmente e realizar o deploy para produção. Ele foi pensado para ser claro tanto para desenvolvedores quanto para assistentes de IA.

## 1. Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados em sua máquina:

- [Node.js](https://nodejs.org/en/) (versão 20 ou superior)
- [pnpm](https://pnpm.io/installation) (gerenciador de pacotes)
- [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose

## 2. Configuração do Ambiente Local

Siga estes passos para ter o projeto rodando em sua máquina.

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/boilerplate-login.git
cd boilerplate-login
```

### Passo 2: Configurar Variáveis de Ambiente

O projeto utiliza um arquivo `.env.local` para gerenciar segredos e variáveis de ambiente.

1.  Crie uma cópia do arquivo de exemplo:
    ```bash
    cp .env.example .env.local
    ```
2.  Abra o arquivo `.env.local` e preencha os valores que faltam, como `JWT_SECRET` e `RESEND_API_KEY`. A `DATABASE_URL` já vem configurada para o ambiente Docker.

    - Para gerar uma `JWT_SECRET` forte, você pode usar o seguinte comando no terminal:
      ```bash
      openssl rand -base64 32
      ```

### Passo 3: Iniciar o Banco de Dados com Docker

Com o Docker em execução na sua máquina, suba o container do PostgreSQL com um único comando:

```bash
docker-compose up -d
```

Isso iniciará um banco de dados PostgreSQL na porta `5432`, pronto para ser usado pela aplicação.

### Passo 4: Instalar as Dependências

Instale todas as dependências do projeto usando pnpm:

```bash
pnpm install
```

### Passo 5: Executar as Migrações do Banco

Com o banco de dados em execução, aplique o esquema inicial e todas as migrações pendentes com o comando:

```bash
pnpm db:migrate
```

Este comando executa o script `src/lib/migrate.ts`, que cria as tabelas necessárias e mantém um log das migrações aplicadas.

### Passo 6: Iniciar a Aplicação

Finalmente, inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## 3. Deploy para Produção (Vercel)

Para fazer o deploy do projeto, recomendamos a plataforma Vercel.

1.  **Conecte seu Repositório:** Crie um novo projeto na Vercel e conecte-o ao seu repositório do GitHub.
2.  **Configure as Variáveis de Ambiente:** Na seção de "Settings" > "Environment Variables" do seu projeto na Vercel, adicione todas as variáveis contidas no seu arquivo `.env.local`, especialmente:
    - `DATABASE_URL`: A string de conexão para o seu banco de dados de produção (ex: Render, AWS RDS, etc.).
    - `JWT_SECRET`: A mesma chave secreta forte que você definiu localmente.
    - `RESEND_API_KEY`: Sua chave do Resend para produção.
    - `NEXT_PUBLIC_BASE_URL`: A URL final da sua aplicação (ex: `https://meu-app.vercel.app`).
3.  **Deploy:** A Vercel irá automaticamente detectar que é um projeto Next.js e fará o build e o deploy a cada `git push` para a branch principal.

---

Com este guia, o processo de setup e deploy se torna padronizado e significativamente mais simples. 