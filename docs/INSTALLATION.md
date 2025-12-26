# Guia de Instalação - ERP Oficina

> Manual completo e detalhado para instalação, configuração e deploy do ERP Oficina.

**Última atualização:** Dezembro de 2025
**Versão do Documento:** 1.0  
**Compatível com:** Node.js 20.x+

---

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Passo 1: Clonar o Repositório](#passo-1-clonar-o-repositório)
3. [Passo 2: Instalar Dependências](#passo-2-instalar-dependências)
4. [Passo 3: Configurar o Supabase](#passo-3-configurar-o-supabase)
5. [Passo 4: Variáveis de Ambiente](#passo-4-variáveis-de-ambiente)
6. [Passo 5: Executar Servidor de Desenvolvimento](#passo-5-executar-servidor-de-desenvolvimento)
7. [Passo 6: Criar Primeiro Usuário](#passo-6-criar-primeiro-usuário)
8. [Scripts Disponíveis](#scripts-disponíveis)
9. [Troubleshooting](#troubleshooting)
10. [Configuração do VS Code](#configuração-do-vs-code)

---

## Requisitos do Sistema

### Obrigatórios

- **Node.js** 20.x ou superior
- **npm** 9.x+ ou **yarn** 3.x+ ou **pnpm** 8.x+
- **Git** 2.30+
- **Conta no Supabase** (gratuita em [supabase.com](https://supabase.com))
- **Editor de código** (VS Code recomendado)

### Recomendados

- **Git GUI** (GitHub Desktop, Sourcetree, etc.)
- **Postman ou Insomnia** (para testar APIs)
- **pgAdmin** (gerenciador gráfico PostgreSQL)
- **Docker** (para ambiente isolado)

### Verificar Versões Instaladas

```bash
# Node.js
node --version
# v20.x.x

# npm
npm --version
# 9.x.x

# Git
git --version
# git version 2.x.x
```

---

## Passo 1: Clonar o Repositório

### Via HTTPS (Padrão)

```bash
git clone https://github.com/figodevtech/erpoficina.git
cd erpoficina
```

### Via SSH (Recomendado se tiver SSH key)

```bash
git clone git@github.com:figodevtech/erpoficina.git
cd erpoficina
```

### Verificar Clonagem

```bash
# Listar conteúdo
ls -la

# Deve mostrar:
# ├── src/
# ├── docs/
# ├── public/
# ├── package.json
# ├── next.config.js
# └── README.md
```

---

## Passo 2: Instalar Dependências

### Opção 1: npm (Padrão)

```bash
npm install
# ou
npm i

# Para instalar e salvar uma package
npm install package-name
```

### Opção 2: yarn

```bash
yarn install
# ou
yarn

# Para instalar uma package
yarn add package-name
```

### Opção 3: pnpm (Recomendado - mais rápido)

```bash
# Instalar pnpm globalmente (primeira vez)
npm install -g pnpm

# Instalar dependências do projeto
pnpm install

# Para instalar uma package
pnpm add package-name
```

### Verificar Instalação

```bash
# Verificar se todas as dependências foram instaladas
npm list

# Verificar versões principais
npm list next react typescript
```

---

## Passo 3: Configurar o Supabase

### 3.1. Criar Projeto no Supabase

1. **Acessar Supabase**
   - Vá para [supabase.com](https://supabase.com)
   - Clique em "Start Your Project"

2. **Criar Conta ou Fazer Login**
   - Use email/senha ou GitHub OAuth
   - Verifique seu email

3. **Criar Novo Projeto**
   - Clique em "New Project"
   - Selecione sua organização (ou crie uma)
   - Digite o nome do projeto: `erpoficina` (ou seu nome preferido)
   - Defina uma senha forte (super secret password)
   - Selecione a região mais próxima (ex: São Paulo para Brasil)
   - Clique em "Create new project"
   - **Aguarde 1-2 minutos** enquanto o projeto é provisionado

4. **Copiar Credenciais**
   - Após criação, clique em "Settings" → "API"
   - Copie:
     - **Project URL**: `https://xxxx.supabase.co`
     - **anon public key**: `eyJhbG...`
     - **service_role secret**: `eyJhbG...` (saio secreto!)

### 3.2. Executar Migrations

1. **Acessar o Editor SQL**
   - No painel do Supabase, clique em "SQL Editor"
   - Clique em "New Query"

2. **Criar Tabelas Base**
   
   Copie e execute este SQL (em partes, se necessário):

   ```sql
   -- 1. Criar enum para tipos de cliente
   CREATE TYPE client_type AS ENUM ('PF', 'PJ');
   CREATE TYPE os_status AS ENUM ('ORCAMENTO', 'APROVADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ENTREGUE', 'CANCELADA');
   CREATE TYPE item_type AS ENUM ('SERVICO', 'PRODUTO');
   CREATE TYPE movimentacao_type AS ENUM ('ENTRADA', 'SAIDA');
   CREATE TYPE conta_status AS ENUM ('PENDENTE', 'PARCIAL', 'PAGO');

   -- 2. Criar tabelas
   CREATE TABLE empresas (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     nome TEXT NOT NULL,
     cnpj VARCHAR(18) UNIQUE,
     telefone VARCHAR(20),
     email TEXT,
     endereco TEXT,
     cidade TEXT,
     estado VARCHAR(2),
     cep VARCHAR(10),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE users (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     email TEXT UNIQUE NOT NULL,
     nome TEXT,
     empresa_id UUID NOT NULL REFERENCES empresas(id),
     rol
     e VARCHAR(50) DEFAULT 'atendente',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE clientes (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
     nome TEXT NOT NULL,
     cpf_cnpj VARCHAR(18),
     tipo client_type DEFAULT 'PF',
     telefone VARCHAR(20),
     email TEXT,
     endereco TEXT,
     cidade TEXT,
     estado VARCHAR(2),
     cep VARCHAR(10),
     observacoes TEXT,
     ativo BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE veiculos (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
     placa VARCHAR(10) UNIQUE NOT NULL,
     marca TEXT NOT NULL,
     modelo TEXT NOT NULL,
     ano INT,
     cor TEXT,
     km_atual INT,
     observacoes TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE ordens_servico (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
     cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
     veiculo_id UUID NOT NULL REFERENCES veiculos(id),
     numero_os TEXT UNIQUE NOT NULL,
     descricao TEXT,
     status os_status DEFAULT 'ORCAMENTO',
     valor_total DECIMAL(10, 2),
     valor_pago DECIMAL(10, 2) DEFAULT 0,
     data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     data_aprovacao TIMESTAMP,
     data_conclusao TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE os_itens (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
     tipo item_type DEFAULT 'SERVICO',
     descricao TEXT NOT NULL,
     quantidade INT DEFAULT 1,
     valor_unitario DECIMAL(10, 2) NOT NULL,
     valor_total DECIMAL(10, 2) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE produtos (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
     codigo VARCHAR(50) UNIQUE NOT NULL,
     nome TEXT NOT NULL,
     unidade VARCHAR(10) DEFAULT 'UN',
     estoque_minimo INT DEFAULT 5,
     estoque_atual INT DEFAULT 0,
     preco_custo DECIMAL(10, 2),
     preco_venda DECIMAL(10, 2),
     ativo BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE movimentacoes_estoque (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
     tipo movimentacao_type NOT NULL,
     quantidade INT NOT NULL,
     motivo TEXT,
     os_id UUID REFERENCES ordens_servico(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE contas_receber (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
     cliente_id UUID REFERENCES clientes(id),
     os_id UUID REFERENCES ordens_servico(id),
     descricao TEXT NOT NULL,
     valor DECIMAL(10, 2) NOT NULL,
     valor_pago DECIMAL(10, 2) DEFAULT 0,
     data_vencimento DATE NOT NULL,
     data_pagamento DATE,
     status conta_status DEFAULT 'PENDENTE',
     forma_pagamento VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE contas_pagar (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
     fornecedor TEXT NOT NULL,
     descricao TEXT NOT NULL,
     valor DECIMAL(10, 2) NOT NULL,
     valor_pago DECIMAL(10, 2) DEFAULT 0,
     data_vencimento DATE NOT NULL,
     data_pagamento DATE,
     categoria VARCHAR(50),
     status conta_status DEFAULT 'PENDENTE',
     forma_pagamento VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- 3. Criar índices
   CREATE INDEX idx_clientes_empresa_id ON clientes(empresa_id);
   CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
   CREATE INDEX idx_veiculos_cliente_id ON veiculos(cliente_id);
   CREATE INDEX idx_veiculos_placa ON veiculos(placa);
   CREATE INDEX idx_ordens_empresa_id ON ordens_servico(empresa_id);
   CREATE INDEX idx_ordens_cliente_id ON ordens_servico(cliente_id);
   CREATE INDEX idx_ordens_status ON ordens_servico(status);
   CREATE INDEX idx_ordens_numero ON ordens_servico(numero_os);
   CREATE INDEX idx_produtos_empresa_id ON produtos(empresa_id);
   CREATE INDEX idx_produtos_codigo ON produtos(codigo);
   CREATE INDEX idx_contas_receber_status ON contas_receber(status);
   CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);

   -- 4. Habilitar RLS
   ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
   ALTER TABLE os_itens ENABLE ROW LEVEL SECURITY;
   ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
   ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
   ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
   ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;

   -- 5. Criar policies RLS
   CREATE POLICY "Users can access own company data" ON clientes
     FOR SELECT USING (
       empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid())
     );

   CREATE POLICY "Users can insert own company clients" ON clientes
     FOR INSERT WITH CHECK (
       empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid())
     );

   CREATE POLICY "Users can update own company clients" ON clientes
     FOR UPDATE USING (
       empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid())
     );

   -- Aplicar policies similares para outras tabelas...
   ```

3. **Validar Criação**
   - Vá para "Table Editor" → "All tables"
   - Deve listar todas as tabelas criadas

### 3.3. Configurar Autenticação

1. **Acessar Authentication Settings**
   - Clique em "Authentication" no menu lateral
   - Selecione "Providers"

2. **Configurar Email**
   - Aba "Email"
   - Habilite "Email Provider"
   - (Opcionais) Configure templates de email customizados

3. **Configurar OAuth (Opcional)**
   - Para Google: Obtenha credenciais em [Google Cloud Console](https://console.cloud.google.com)
   - Para GitHub: Vá em GitHub Settings → Developer Settings → OAuth Apps

---

## Passo 4: Variáveis de Ambiente

### 4.1. Copiar Arquivo de Exemplo

**Windows (Command Prompt):**
```cmd
copy .env.example .env.local
```

**macOS/Linux:**
```bash
cp .env.example .env.local
```

### 4.2. Preencher Variáveis de Ambiente

Edite o arquivo `.env.local` com seus editores favoritos:

```env
# ============================================
# SUPABASE CONFIGURATION
# ============================================

# Obtido em: Supabase → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# ⚠️ SEGREDO - Não compartilhar!
# Obtido em: Supabase → Settings → API → service_role secret
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# ============================================
# NEXTAUTH CONFIGURATION
# ============================================

# Gerar com: openssl rand -base64 32
# Ou: https://generate-secret.vercel.app/32
AUTH_SECRET=sua-chave-secreta-aqui-gerada-com-32-caracteres

# URL onde a aplicação está rodando
NEXTAUTH_URL=http://localhost:3000

# ============================================
# APPLICATION CONFIGURATION
# ============================================

# URL pública da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment (development, production, staging)
NODE_ENV=development

# ============================================
# OPTIONAL - Email Service (se usar)
# ============================================

# SENDGRID_API_KEY=your-key-here
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password

# ============================================
# OPTIONAL - Storage (se usar)
# ============================================

# AWS_ACCESS_KEY_ID=your-key-here
# AWS_SECRET_ACCESS_KEY=your-key-here
# AWS_S3_BUCKET=your-bucket-name
```

### 4.3. Como Obter as Credenciais

#### Obter URL e Keys do Supabase

1. Acesse seu painel Supabase
2. Clique em **Settings** (engrenagem no canto inferior esquerdo)
3. Selecione a aba **API**
4. Você verá:
   - **Project URL**: copie para `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys**:
     - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ guardado!)

#### Gerar AUTH_SECRET

**macOS/Linux:**
```bash
openssl rand -base64 32
# Saída: ABC123def456GHI789jkl012MNO345pqr678stu==
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Ou acesse:**
```
https://generate-secret.vercel.app/32
```

Copie o resultado para `AUTH_SECRET` no `.env.local`

### 4.4. Validar Variáveis de Ambiente

```bash
# Verificar se arquivo foi criado
ls -la .env.local

# Verificar se contém valores (não exibir valores sensíveis)
grep "NEXT_PUBLIC" .env.local
```

---

## Passo 5: Executar Servidor de Desenvolvimento

### 5.1. Iniciar Servidor

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

### 5.2. Acessar Aplicação

```
Abra seu navegador em: http://localhost:3000
```

Você deve ver a página de login do ERP Oficina.

### 5.3. Verificar Console

No terminal, deve aparecer:

```
  ▲ Next.js 15.5.7
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

### 5.4. Hot Reload (Desenvolvimento)

Qualquer alteração de código no `src/` será refletida em tempo real no navegador.

---

## Passo 6: Criar Primeiro Usuário

### Opção 1: Via Interface Web (Recomendado)

1. **Acessar Signup**
   - Vá para `http://localhost:3000/register`

2. **Preencher Formulário**
   - Email: `seu-email@example.com`
   - Senha: (mínimo 8 caracteres)
   - Confirmar senha
   - Nome da empresa: `Minha Oficina`

3. **Submeter**
   - Clique em "Cadastrar"
   - Verifique email para confirmação (se habilitado)

4. **Acessar Dashboard**
   - Efetue login com credenciais criadas
   - Será redirecionado para `/app/dashboard`

### Opção 2: Diretamente no Supabase

1. **Acessar Supabase Dashboard**
   - Vá para seu projeto Supabase
   - Clique em **Authentication** → **Users**

2. **Criar Usuário**
   - Clique em **+ Add user**
   - Email: `seu-email@example.com`
   - Password: (forte)
   - Clique em **Create user**

3. **Adicionar Dados Relacionados**
   - Vá para **SQL Editor**
   - Execute:

   ```sql
   -- Criar empresa
   INSERT INTO empresas (nome, cnpj, email, cidade, estado)
   VALUES ('Minha Oficina', '12345678901234', 'oficina@example.com', 'São Paulo', 'SP')
   RETURNING id;
   
   -- Copie o ID retornado e use abaixo
   
   -- Criar usuário na tabela users
   INSERT INTO users (id, email, nome, empresa_id, role)
   VALUES (
     'uuid-do-usuario-do-auth',  -- Veja em Authentication → Users
     'seu-email@example.com',
     'Nome Completo',
     'uuid-da-empresa',  -- Do comando INSERT anterior
     'admin'
   );
   ```

4. **Efetuar Login**
   - Vá para `http://localhost:3000/login`
   - Use email e senha criados

---

## Scripts Disponíveis

### Scripts do package.json

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `npm run dev` | Inicia servidor de desenvolvimento | Desenvolvimento local |
| `npm run build` | Compila para produção | Antes do deploy |
| `npm run start` | Inicia servidor de produção | Produção local |
| `npm run lint` | Valida código com ESLint | Garantir qualidade |
| `npm run format` | Formata código com Prettier | Padronizar código |
| `npm run type-check` | Verifica tipos TypeScript | Encontrar erros de tipo |
| `npm test` | Executa testes | Testes unitários |

### Exemplos de Uso

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm run start

# Verificar qualidade do código
npm run lint
npm run format
npm run type-check

# Build + Start (uma linha)
npm run build && npm run start

# Limpar cache e reinstalar
rm -rf node_modules .next
npm install
npm run dev
```

---

## Troubleshooting

### Erro: "Module not found"

**Problema:** Não encontra módulos ao executar `npm run dev`

**Solução:**

```bash
# 1. Limpar cache
rm -rf node_modules .next

# 2. Reinstalar dependências
npm install

# 3. Executar novamente
npm run dev

# Se persistir, tente:
npm cache clean --force
npm install
```

### Erro: "Cannot find Supabase configuration"

**Problema:** Variáveis de ambiente não configuradas

**Solução:**

```bash
# 1. Verificar arquivo .env.local existe
ls -la .env.local

# 2. Verificar variáveis estão preenchidas
grep "NEXT_PUBLIC_SUPABASE_URL" .env.local

# 3. Reiniciar servidor (Ctrl+C, depois npm run dev)
```

### Erro: "Unauthorized" ou "Network Error"

**Problema:** Supabase inacessível ou credenciais inválidas

**Solução:**

```bash
# 1. Verificar credenciais em .env.local
# 2. Confirmar projeto Supabase está ativo
# 3. Verificar conectividade:
curl https://seu-projeto.supabase.co

# 4. Verificar se RLS policies não bloqueiam
# Supabase → Authentication → Enable Anonymous Signups (temporariamente)

# 5. Se tudo falhar, criar novo projeto no Supabase
```

### Erro: "NextAuth configuration missing"

**Problema:** AUTH_SECRET não está configurado

**Solução:**

```bash
# 1. Verificar .env.local
grep "AUTH_SECRET" .env.local

# 2. Se vazio, gerar novo:
openssl rand -base64 32

# 3. Copiar resultado para .env.local
AUTH_SECRET=gerado-acima

# 4. Salvar e reiniciar servidor
# Ctrl+C
npm run dev
```

### Erro: "TypeScript errors"

**Problema:** Erros de tipos no código

**Solução:**

```bash
# 1. Verificar erros específicos
npm run type-check

# 2. Limpar cache do Next.js
rm -rf .next

# 3. Reinstalar dependências
npm install

# 4. Rodar novamente
npm run dev
```

### Porta 3000 Já em Uso

**Problema:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solução Windows:**
```cmd
# Encontrar processo usando porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua 1234 pelo PID)
taskkill /PID 1234 /F
```

**Solução macOS/Linux:**
```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
npm run dev -- -p 3001
```

### Lentidão ou Freezing

**Problema:** Aplicação lenta ou travando

**Solução:**

```bash
# 1. Verificar uso de RAM
# (abrir Task Manager/Activity Monitor)

# 2. Limpar caches
rm -rf .next node_modules

# 3. Reinstalar
npm install

# 4. Rodar dev em modo debug
npm run dev -- --debug

# 5. Se problema persiste, considere usar pnpm ou yarn
```

---

## Configuração do VS Code

### Extensões Recomendadas

Instale as seguintes extensões no VS Code:

1. **ESLint** - Microsoft
   - Identifica problemas de código
   - `code --install-extension dbaeumer.vscode-eslint`

2. **Prettier** - Prettier
   - Formata código automaticamente
   - `code --install-extension esbenp.prettier-vscode`

3. **Tailwind CSS IntelliSense** - Tailwind Labs
   - Autocomplete para Tailwind
   - `code --install-extension bradlc.vscode-tailwindcss`

4. **TypeScript Importer** - Ethan Cohen
   - Import automático de tipos
   - `code --install-extension ethanstein.vscode-twix`

5. **Thunder Client** (opcional)
   - Testa APIs diretamente no VS Code
   - `code --install-extension rangav.vscode-thunder-client`

### Configurar VS Code

Crie ou atualize o arquivo `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Snippets Úteis

Crie `.vscode/snippets.code-snippets`:

```json
{
  "React Component": {
    "prefix": "rc",
    "body": [
      "export function ${1:ComponentName}() {",
      "  return (",
      "    <div>",
      "      ${2:content}",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "Criar componente React"
  },
  "Use Query Hook": {
    "prefix": "uq",
    "body": [
      "const { data, isLoading } = useQuery({",
      "  queryKey: ['${1:key}'],",
      "  queryFn: () => ${2:fetcher}(),",
      "});"
    ],
    "description": "Use Query hook"
  }
}
```

### Launch Configuration

Para debugar, crie `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js Debug",
      "type": "node",
      "request": "launch",
      "skipFiles": ["<node_internals>/**"],
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/next",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Próximos Passos

### 1. Explorar a Aplicação
- Crie alguns clientes de teste
- Registre ordens de serviço
- Navegue pelos módulos

### 2. Estudar Documentação
- Leia [TECHNICAL.md](TECHNICAL.md) para arquitetura
- Consulte [USER_GUIDE.md](USER_GUIDE.md) para uso do sistema

### 3. Personalizações
- Configure dados da sua empresa em Configurações
- Customize categorias e setor
- Adicione mais usuários conforme necessário

### 4. Deploy (Opcional)
- Para produção, veja seção "Deploy em Produção"
- Recomenda-se usar **Vercel** (criador do Next.js)

---

## Deploy em Produção (Vercel)

### 1. Preparar para Deploy

```bash
# Verificar que tudo funciona
npm run build

# Deve completar sem erros
```

### 2. Conectar ao Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel
```

### 3. Configurar Variáveis de Ambiente

No painel Vercel:
- Vá para **Settings** → **Environment Variables**
- Adicione as mesmas do `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `AUTH_SECRET`
  - `NEXTAUTH_URL` (usar URL do Vercel)

### 4. Deployar

```bash
# Fazer push para main branch
git add .
git commit -m "Ready for production"
git push origin main

# Vercel faz deploy automaticamente
```

---

<div align="center">

**Guia de Instalação v1.0**

Precisa de ajuda? Abra uma [issue no GitHub](https://github.com/figodevtech/erpoficina/issues)

[← Voltar ao README](../README.md)

</div>
