# ERP Oficina

Um sistema de gestão (ERP) completo para oficinas mecânicas, desenvolvido com as tecnologias mais modernas para otimizar processos e aumentar a eficiência.

## ✨ Funcionalidades Principais

- **Gestão de Clientes:** Cadastro, histórico e informações de contato.
- **Ordens de Serviço:** Criação, acompanhamento e finalização de O.S.
- **Controle de Estoque:** Gerenciamento de peças e produtos.
- **Financeiro:** Controle de contas a pagar e receber.
- **Dashboard:** Visualização rápida dos principais indicadores da oficina.
- **Autenticação e Permissões:** Sistema de login seguro com diferentes níveis de acesso para usuários.

## 🚀 Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (com App Router e Turbopack)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/UI](https://ui.shadcn.com/)
- **Backend & Banco de Dados:** [Supabase](https://supabase.io/)
- **Autenticação:** [NextAuth.js](https://next-auth.js.org/)
- **Validação de Formulários e Esquemas:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Busca de Dados:** [TanStack Query](https://tanstack.com/query/latest)
- **Linting:** [ESLint](https://eslint.org/)

## 🏁 Começando

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão 20.x ou superior)
- [npm](https://www.npmjs.com/) ou um gerenciador de pacotes compatível (Yarn, pnpm)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/erpoficina.git
cd erpoficina
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie uma cópia do arquivo de exemplo `.env.example` e renomeie para `.env.local`.

```bash
# No Windows
copy .env.example .env.local

# No macOS / Linux
cp .env.example .env.local
```

Preencha o arquivo `.env.local` com as suas credenciais do Supabase e um `AUTH_SECRET` para o NextAuth.

- As chaves do Supabase podem ser encontradas em `Project Settings > API` no seu painel do Supabase.
- Para gerar um `AUTH_SECRET`, você pode usar o comando: `openssl rand -base64 32` ou acessar [este link](https://generate-secret.vercel.app/32).

### 4. Execute o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 📂 Estrutura do Projeto

O projeto utiliza o `App Router` do Next.js e a pasta `src/` para organizar o código.

```
erpoficina/
├── src/
│   ├── app/                # Rotas, páginas e layouts da aplicação
│   │   ├── (app)/          # Rotas protegidas por autenticação
│   │   ├── (pages)/        # Páginas públicas (login, etc.)
│   │   └── api/            # Rotas de API do Next.js
│   ├── components/         # Componentes React reutilizáveis (UI e de layout)
│   ├── lib/                # Funções utilitárias, serviços e configuração de libs (Supabase, Auth)
│   ├── hooks/              # Hooks React customizados
│   └── types/              # Definições de tipos TypeScript
├── public/                 # Arquivos estáticos (imagens, fontes)
└── ...                     # Arquivos de configuração (Next.js, Tailwind, etc.)
```

## 🚀 Deploy

A forma mais fácil de fazer o deploy da sua aplicação Next.js é utilizando a [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), dos criadores do Next.js.

Confira a [documentação de deploy do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.
