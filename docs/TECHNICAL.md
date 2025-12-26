# Documentação Técnica - ERP Oficina

> Guia completo de arquitetura, padrões e implementação técnica do sistema ERP Oficina.

**Última atualização:** Dezembro de 2025
**Versão do Documento:** 1.0  
**Compatível com:** ERP Oficina v1.0+

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Next.js App Router](#nextjs-app-router)
3. [Sistema de Autenticação](#sistema-de-autenticação)
4. [Banco de Dados e Supabase](#banco-de-dados-e-supabase)
5. [State Management e Data Fetching](#state-management-e-data-fetching)
6. [Validação e Formulários](#validação-e-formulários)
7. [Componentes UI](#componentes-ui)
8. [Performance](#performance)
9. [Segurança](#segurança)
10. [Testes](#testes)
11. [Convenções de Código](#convenções-de-código)

---

## Visão Geral da Arquitetura

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER / CLIENT SIDE                   │
│  (React Components, Client-side State, Event Handlers)      │
└────────────────────────────┬────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Next.js 15    │
                    │   App Router    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼─────┐      ┌──────▼──────┐      ┌─────▼────┐
   │   Pages  │      │ API Routes  │      │ Middleware
   │   (SSR)  │      │  (Backend)  │      │ (Auth)
   └────┬─────┘      └──────┬──────┘      └─────┬────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   ┌────▼──────────┐  ┌──────▼──────┐  ┌─────────▼──┐
   │  Supabase DB  │  │ NextAuth.js │  │  Supabase  │
   │  (PostgreSQL) │  │  (Session)  │  │  Storage   │
   └───────────────┘  └─────────────┘  └────────────┘
```

### Padrão de Arquitetura: Clean Hexagonal

O projeto segue princípios de **arquitetura hexagonal** (ports & adapters):

- **Domain Layer**: Lógica de negócio pura
- **Application Layer**: Casos de uso e orquestração
- **Infrastructure Layer**: Integração com Supabase, Auth, etc.
- **Presentation Layer**: Componentes React e páginas

### Fluxo de Dados

```
1. User Interaction (Click, Form Submit)
   ↓
2. Client Component Event Handler
   ↓
3. Mutation / Query (TanStack Query)
   ↓
4. API Route ou Server Action
   ↓
5. Supabase Client Library
   ↓
6. PostgreSQL Database
   ↓
7. Response → Cache → UI Update
```

### Separação de Responsabilidades

| Layer | Responsabilidade | Tecnologia |
|-------|-----------------|-----------|
| **UI/Components** | Renderização, interação do usuário | React, shadcn/ui |
| **Hooks** | Lógica customizada reutilizável | React Hooks |
| **API Routes** | Lógica de servidor, validações | Next.js API Routes |
| **Services** | Abstração de chamadas externas | Supabase Client |
| **Database** | Persistência de dados | PostgreSQL/Supabase |
| **Auth** | Autenticação e autorização | NextAuth.js v5 |

---

## Next.js App Router

### Estrutura de Rotas

O projeto utiliza o **App Router** (não Pages Router):

```
src/app/
├── (app)/                          # Rotas protegidas (autenticadas)
│   ├── layout.tsx                  # Layout principal
│   ├── page.tsx                    # Dashboard (/app)
│   ├── clientes/
│   │   ├── page.tsx               # Lista de clientes
│   │   ├── [id]/
│   │   │   └── page.tsx           # Detalhe do cliente
│   │   └── novo/
│   │       └── page.tsx           # Formulário novo cliente
│   ├── ordens/
│   │   ├── page.tsx               # Lista de O.S.
│   │   ├── [id]/
│   │   │   └── page.tsx           # Detalhe da O.S.
│   │   └── nova/
│   │       └── page.tsx           # Formulário nova O.S.
│   ├── estoque/
│   │   ├── page.tsx               # Controle de estoque
│   │   └── [id]/
│   │       └── page.tsx           # Detalhe do produto
│   ├── financeiro/
│   │   ├── page.tsx               # Dashboard financeiro
│   │   ├── contas-receber/
│   │   │   └── page.tsx
│   │   └── contas-pagar/
│   │       └── page.tsx
│   └── configuracoes/
│       ├── page.tsx               # Configurações gerais
│       ├── usuarios/
│       │   └── page.tsx
│       └── empresa/
│           └── page.tsx
│
├── (pages)/                        # Rotas públicas (não autenticadas)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── reset-senha/
│   │   └── page.tsx
│   └── layout.tsx
│
├── api/                           # API Routes (backend)
│   ├── auth/
│   │   ├── [nextauth]/
│   │   │   └── route.ts          # NextAuth handler
│   │   └── callback/
│   │       └── route.ts
│   ├── clientes/
│   │   ├── route.ts              # GET, POST clientes
│   │   └── [id]/
│   │       └── route.ts          # GET, PUT, DELETE cliente
│   ├── ordens/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   └── ...
│
├── middleware.ts                  # Middleware global
├── layout.tsx                     # Root layout
└── page.tsx                       # Home public
```

### Server Components vs Client Components

**Server Components** (padrão em Next.js 15):

```typescript
// src/app/(app)/clientes/page.tsx
import { getClientes } from '@/lib/services/clientes';

export default async function ClientesPage() {
  const clientes = await getClientes(); // ✅ Executa no servidor
  
  return (
    <div>
      <h1>Clientes</h1>
      <ClientList clientes={clientes} />
    </div>
  );
}
```

**Client Components** (necessário para interatividade):

```typescript
// src/components/ClientList.tsx
'use client';

import { useState } from 'react';

export function ClientList({ clientes }) {
  const [search, setSearch] = useState(''); // ✅ Hooks precisam de 'use client'
  
  return (
    <div>
      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar..."
      />
      {/* ... */}
    </div>
  );
}
```

### Data Fetching Strategies

#### 1. Server-Side Fetching (Recomendado)

```typescript
// src/app/(app)/ordens/page.tsx
import { Suspense } from 'react';
import { getOrdens } from '@/lib/services/ordens';
import { OrdensList } from '@/components/OrdensList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function OrdensPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrdensContent />
    </Suspense>
  );
}

async function OrdensContent() {
  const ordens = await getOrdens();
  return <OrdensList ordens={ordens} />;
}
```

#### 2. Client-Side Fetching (TanStack Query)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getOrdens } from '@/lib/services/ordens';

export function OrdensContent() {
  const { data: ordens, isLoading } = useQuery({
    queryKey: ['ordens'],
    queryFn: getOrdens,
  });

  if (isLoading) return <div>Carregando...</div>;
  return <OrdensList ordens={ordens} />;
}
```

#### 3. Revalidation Estratégies

```typescript
// src/app/(app)/clientes/page.tsx
import { revalidatePath } from 'next/cache';

export const revalidate = 3600; // ISR - revalidate a cada 1 hora

// Ou manualmente:
async function createCliente(data) {
  const result = await api.createCliente(data);
  revalidatePath('/app/clientes'); // Revalidar cache específico
  return result;
}
```

### Route Handlers (API Routes)

```typescript
// src/app/api/clientes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET - Listar clientes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('empresa_id', session.user.empresa_id);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar cliente
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const { data, error } = await supabase
      .from('clientes')
      .insert([{ ...body, empresa_id: session.user.empresa_id }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Middleware e Autenticação

```typescript
// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Rotas públicas
  if (pathname.startsWith('/(pages)')) {
    return NextResponse.next();
  }

  // Rotas protegidas - redirecionar se não autenticado
  if (!session && pathname.startsWith('/(app)')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
};
```

---

## Sistema de Autenticação

### NextAuth.js v5 Configuração

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { supabase } from './supabase';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (error || !data.user) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login?error=CredentialsSignin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role;
      return session;
    },
  },
});
```

### Session Management

```typescript
// src/lib/auth.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
```

### Proteção de Rotas

```typescript
// src/lib/auth.ts
export async function requireAuth() {
  const session = await auth();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

// Uso:
// src/app/(app)/dashboard/page.tsx
import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await requireAuth();
  // ... seguro que usuário autenticado
}
```

### Políticas de Acesso (RBAC)

```typescript
// src/lib/auth.ts
export enum UserRole {
  ADMIN = 'admin',
  GERENTE = 'gerente',
  MECANICO = 'mecanico',
  ATENDENTE = 'atendente',
  FINANCEIRO = 'financeiro',
}

export async function requireRole(requiredRole: UserRole) {
  const session = await auth();
  
  if (!session || !hasRole(session.user.role, requiredRole)) {
    throw new Error('Access Denied');
  }
  
  return session;
}

function hasRole(userRole: string, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.ADMIN]: [
      UserRole.ADMIN,
      UserRole.GERENTE,
      UserRole.MECANICO,
      UserRole.ATENDENTE,
      UserRole.FINANCEIRO,
    ],
    [UserRole.GERENTE]: [
      UserRole.GERENTE,
      UserRole.MECANICO,
      UserRole.ATENDENTE,
      UserRole.FINANCEIRO,
    ],
    [UserRole.MECANICO]: [UserRole.MECANICO],
    [UserRole.ATENDENTE]: [UserRole.ATENDENTE],
    [UserRole.FINANCEIRO]: [UserRole.FINANCEIRO],
  };

  return roleHierarchy[userRole]?.includes(requiredRole) ?? false;
}
```

---

## Banco de Dados e Supabase

### Schema do Banco de Dados

```sql
-- Tabela de usuários (gerenciada pelo Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  nome TEXT,
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  perfil_id INT NOT NULL REFERENCES perfis_permissao(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de empresas/oficinas
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

-- Tabela de clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf_cnpj VARCHAR(18),
  tipo ENUM('PF', 'PJ') DEFAULT 'PF',
  telefone VARCHAR(20),
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado VARCHAR(2),
  cep VARCHAR(10),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(empresa_id, cpf_cnpj)
);

-- Tabela de veículos
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

-- Tabela de ordens de serviço
CREATE TABLE ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  veiculo_id UUID NOT NULL REFERENCES veiculos(id),
  numero_os TEXT UNIQUE NOT NULL,
  descricao TEXT,
  status ENUM('ORCAMENTO', 'APROVADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ENTREGUE', 'CANCELADA') DEFAULT 'ORCAMENTO',
  valor_total DECIMAL(10, 2),
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_aprovacao TIMESTAMP,
  data_conclusao TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens de O.S.
CREATE TABLE os_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  tipo ENUM('SERVICO', 'PRODUTO') DEFAULT 'SERVICO',
  descricao TEXT NOT NULL,
  quantidade INT DEFAULT 1,
  valor_unitario DECIMAL(10, 2) NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos/peças
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  categoria_id INT REFERENCES categorias(id),
  unidade VARCHAR(10) DEFAULT 'UN',
  estoque_minimo INT DEFAULT 5,
  estoque_atual INT DEFAULT 0,
  preco_custo DECIMAL(10, 2),
  preco_venda DECIMAL(10, 2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de movimentações de estoque
CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo ENUM('ENTRADA', 'SAIDA') NOT NULL,
  quantidade INT NOT NULL,
  motivo TEXT,
  os_id UUID REFERENCES ordens_servico(id),
  usuario_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas a receber
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
  status ENUM('PENDENTE', 'PARCIAL', 'PAGO') DEFAULT 'PENDENTE',
  forma_pagamento VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contas a pagar
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
  status ENUM('PENDENTE', 'PARCIAL', 'PAGO') DEFAULT 'PENDENTE',
  forma_pagamento VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de perfis de permissão
CREATE TABLE perfis_permissao (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  permissoes JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo VARCHAR(50),
  nome VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Row Level Security (RLS)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário vê apenas dados da sua empresa
CREATE POLICY "Users can access own company data" ON clientes
  FOR SELECT USING (empresa_id IN (
    SELECT empresa_id FROM users WHERE id = auth.uid()
  ));

-- Policy: Inserir clientes apenas em sua empresa
CREATE POLICY "Users can insert own company clients" ON clientes
  FOR INSERT WITH CHECK (
    empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid())
  );

-- Policy: Atualizar apenas clientes próprios
CREATE POLICY "Users can update own company clients" ON clientes
  FOR UPDATE USING (
    empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid())
  );
```

### Índices para Performance

```sql
-- Índices em chaves estrangeiras
CREATE INDEX idx_clientes_empresa_id ON clientes(empresa_id);
CREATE INDEX idx_veiculos_cliente_id ON veiculos(cliente_id);
CREATE INDEX idx_ordens_empresa_id ON ordens_servico(empresa_id);
CREATE INDEX idx_ordens_cliente_id ON ordens_servico(cliente_id);
CREATE INDEX idx_produtos_empresa_id ON produtos(empresa_id);

-- Índices em campos de busca frequente
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_veiculos_placa ON veiculos(placa);
CREATE INDEX idx_ordens_numero ON ordens_servico(numero_os);
CREATE INDEX idx_produtos_codigo ON produtos(codigo);

-- Índices em campos de status
CREATE INDEX idx_ordens_status ON ordens_servico(status);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);

-- Índices em datas para queries históricas
CREATE INDEX idx_ordens_data_criacao ON ordens_servico(data_criacao DESC);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_estoque(created_at DESC);
```

---

## State Management e Data Fetching

### TanStack Query (React Query) Setup

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

```typescript
// src/app/layout.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### Padrões de Cache

```typescript
// src/hooks/useClientes.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const QUERY_KEY = ['clientes'];

export function useClientes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => api.get('/clientes'),
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => api.get(`/clientes/${id}`),
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/clientes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateCliente(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.put(`/clientes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] });
    },
  });
}
```

### Optimistic Updates

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useUpdateStatus(osId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newStatus) => api.put(`/ordens/${osId}`, { status: newStatus }),
    onMutate: async (newStatus) => {
      // Cancelar queries pendentes
      await queryClient.cancelQueries({ queryKey: ['ordens', osId] });

      // Snapshot do valor antigo
      const previousData = queryClient.getQueryData(['ordens', osId]);

      // Atualizar cache otimisticamente
      queryClient.setQueryData(['ordens', osId], (old) => ({
        ...old,
        status: newStatus,
      }));

      return { previousData };
    },
    onError: (err, newStatus, context) => {
      // Reverter em caso de erro
      queryClient.setQueryData(['ordens', osId], context.previousData);
    },
  });
}
```

### Error Handling

```typescript
// src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      throw new Error('Sem permissão para esta ação');
    }
    
    throw error;
  }
);

// Uso com TanStack Query
export function useOrdens() {
  return useQuery({
    queryKey: ['ordens'],
    queryFn: () => api.get('/ordens'),
    throwOnError: true,
  });
}
```

---

## Validação e Formulários

### Schemas Zod por Módulo

```typescript
// src/lib/schemas/clientes.ts
import { z } from 'zod';

export const ClienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf_cnpj: z.string().regex(/^\d{11,14}$/, 'CPF/CNPJ inválido'),
  tipo: z.enum(['PF', 'PJ']),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2).optional(),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').optional(),
  observacoes: z.string().optional(),
});

export type Cliente = z.infer<typeof ClienteSchema>;
```

```typescript
// src/lib/schemas/ordens.ts
import { z } from 'zod';

export const OrdemServicoSchema = z.object({
  cliente_id: z.string().uuid('Cliente inválido'),
  veiculo_id: z.string().uuid('Veículo inválido'),
  descricao: z.string().min(10, 'Descrição muito curta'),
  status: z.enum(['ORCAMENTO', 'APROVADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'ENTREGUE', 'CANCELADA']),
  itens: z.array(
    z.object({
      tipo: z.enum(['SERVICO', 'PRODUTO']),
      descricao: z.string().min(3),
      quantidade: z.number().int().positive(),
      valor_unitario: z.number().positive(),
    })
  ).min(1, 'Adicione pelo menos um item'),
});

export type OrdemServico = z.infer<typeof OrdemServicoSchema>;
```

### React Hook Form Integração

```typescript
// src/components/forms/ClienteForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClienteSchema, type Cliente } from '@/lib/schemas/clientes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormError } from '@/components/ui/form-error';

export function ClienteForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Cliente>({
    resolver: zodResolver(ClienteSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="nome">Nome *</label>
        <Input
          id="nome"
          {...register('nome')}
          placeholder="Nome completo"
        />
        {errors.nome && <FormError>{errors.nome.message}</FormError>}
      </div>

      <div>
        <label htmlFor="cpf_cnpj">CPF/CNPJ *</label>
        <Input
          id="cpf_cnpj"
          {...register('cpf_cnpj')}
          placeholder="000.000.000-00"
        />
        {errors.cpf_cnpj && <FormError>{errors.cpf_cnpj.message}</FormError>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
}
```

### Server-Side Validation

```typescript
// src/app/api/clientes/route.ts
import { ClienteSchema } from '@/lib/schemas/clientes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ClienteSchema.parse(body);

    // Validação adicional no servidor
    const existing = await supabase
      .from('clientes')
      .select('id')
      .eq('cpf_cnpj', validatedData.cpf_cnpj)
      .single();

    if (existing.data) {
      return NextResponse.json(
        { error: 'Cliente com este CPF/CNPJ já existe' },
        { status: 409 }
      );
    }

    // Inserir no banco
    const { data, error } = await supabase
      .from('clientes')
      .insert([validatedData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Componentes UI

### Sistema de Design

O projeto usa **shadcn/ui** com customizações baseadas em design system:

```typescript
// src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950',
  {
    variants: {
      variant: {
        default:
          'bg-slate-900 text-slate-50 hover:bg-slate-800 focus-visible:ring-slate-300 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
        destructive:
          'bg-red-500 text-slate-50 hover:bg-red-600 focus-visible:ring-red-500',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50',
        link: 'text-slate-900 underline-offset-4 hover:underline dark:text-slate-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  // ...
}

export const Button = ({
  className,
  variant,
  size,
  ...props
}: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
);
```

### Responsividade

```typescript
// src/components/Layout/Sidebar.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      className={cn(
        // Mobile
        'fixed inset-0 z-40 bg-slate-900 transition-transform duration-300 md:relative md:w-64',
        // Desktop
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
    >
      <nav className="p-4">
        {/* Navigation items */}
      </nav>
    </aside>
  );
}
```

### Tema Escuro

```typescript
// src/components/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

```typescript
// src/components/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

### Acessibilidade

```typescript
// src/components/ui/Dialog.tsx
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export function DialogContent({ children, ...props }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content
        className="fixed left-1/2 top-1/2 max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg focus:outline-none"
        {...props}
      >
        {children}
        <Dialog.Close asChild>
          <button
            className="absolute right-4 top-4 rounded-sm hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
```

---

## Performance

### Code Splitting e Lazy Loading

```typescript
// src/components/HeavyChart.tsx
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('recharts'), {
  loading: () => <p>Carregando gráfico...</p>,
  ssr: false,
});

export function Dashboard() {
  return (
    <div>
      <Chart />
    </div>
  );
}
```

### Image Optimization

```typescript
// src/components/ProductImage.tsx
import Image from 'next/image';

export function ProductImage({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={300}
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/png;base64,..."
    />
  );
}
```

### Font Optimization

```typescript
// src/app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const mono = JetBrains_Mono({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Bundle Analysis

```bash
# Instalar next-bundle-analyzer
npm install --save-dev @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({});

# Rodar análise
ANALYZE=true npm run build
```

---

## Segurança

### Proteção contra CSRF, XSS, SQL Injection

```typescript
// src/lib/security.ts
import DOMPurify from 'isomorphic-dompurify';

// Sanitizar inputs
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

// Escape para contextos específicos
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

### Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}

// Uso em API Route
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // ... continuar
}
```

### Content Security Policy

```typescript
// next.config.js
const headers = async () => {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'",
        },
      ],
    },
  ];
};
```

### Variáveis de Ambiente Sensíveis

```typescript
// src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Public
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Private (nunca expostas ao cliente)
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  AUTH_SECRET: z.string(),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

## Testes

### Estratégia de Testes

```
Unit Tests (60%)
├── Functions utilitárias
├── Validators (Zod)
└── Hooks

Integration Tests (30%)
├── API Routes
├── Database queries
└── Auth flow

E2E Tests (10%)
├── User journeys
├── Critical paths
└── Forms
```

### Setup de Testes

```typescript
// src/__tests__/setup.ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock de Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }),
  },
}));
```

### Unit Test Exemplo

```typescript
// src/__tests__/lib/validators.test.ts
import { describe, it, expect } from 'vitest';
import { ClienteSchema } from '@/lib/schemas/clientes';

describe('ClienteSchema', () => {
  it('deve validar cliente válido', () => {
    const data = {
      nome: 'João Silva',
      cpf_cnpj: '12345678901',
      tipo: 'PF',
      telefone: '1133334444',
    };

    const result = ClienteSchema.parse(data);
    expect(result).toEqual(data);
  });

  it('deve falhar com nome muito curto', () => {
    const data = {
      nome: 'Jo',
      cpf_cnpj: '12345678901',
      tipo: 'PF',
      telefone: '1133334444',
    };

    expect(() => ClienteSchema.parse(data)).toThrow();
  });

  it('deve falhar com CPF inválido', () => {
    const data = {
      nome: 'João Silva',
      cpf_cnpj: 'invalid',
      tipo: 'PF',
      telefone: '1133334444',
    };

    expect(() => ClienteSchema.parse(data)).toThrow();
  });
});
```

---

## Convenções de Código

### Naming Conventions

```typescript
// Componentes React (PascalCase)
export function ClientList() {}
export const UserCard = () => {}

// Funções e variáveis (camelCase)
function calculateTotal(items) {}
const maxRetries = 3;

// Constantes (UPPER_SNAKE_CASE)
const DEFAULT_PAGE_SIZE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Tipos e Interfaces (PascalCase)
interface User {
  id: string;
  name: string;
}

type Status = 'pending' | 'approved' | 'completed';

// Arquivos
// - Componentes: Cliente.tsx ou cliente.tsx
// - Tipos: types.ts ou schema.ts
// - Hooks: useClientes.ts
// - Serviços: clienteService.ts
// - Utils: clienteUtils.ts
```

### Estrutura de Arquivos

```typescript
// src/components/clientes/

// ✅ BOM
ClientList.tsx
ClientForm.tsx
ClientCard.tsx
index.ts // Exports

// ❌ EVITAR
client-list.tsx
cliente-form.tsx
ClienteList.tsx (misturando português/inglês)
```

### TypeScript Types e Interfaces

```typescript
// ❌ Evitar
type User = any;
function save(data: any) {}

// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
}

type UserRole = 'admin' | 'user' | 'guest';

async function save(data: User): Promise<User> {
  // ...
}
```

### ESLint Rules

```javascript
// .eslintrc.json
{
  "extends": [
    "next",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react/display-name": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Documentação de Código

```typescript
/**
 * Calcula o total de uma ordem de serviço
 * @param items - Itens da ordem
 * @returns Total em reais
 * @example
 * const total = calculateTotal([
 *   { price: 100, quantity: 2 }
 * ]); // 200
 */
export function calculateTotal(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ❌ Comentários ruins
// pega o total (óbvio pelo nome da função)
const total = calculateTotal(items);

// ✅ Comentários bons
// Aplicar desconto de 10% para clientes VIP
const discountedTotal = calculateTotal(items) * 0.9;
```

---

## Resumo de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APP ROUTER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐        ┌──────────────────┐             │
│  │   Server Pages   │        │  Client Pages    │             │
│  │   (SSR/SSG)      │        │  (Interactivity) │             │
│  └────────┬─────────┘        └────────┬─────────┘             │
│           │                          │                        │
│           └──────────────┬───────────┘                        │
│                          │                                    │
│                  ┌───────▼────────┐                          │
│                  │  Components    │                          │
│                  │  (Reusable)    │                          │
│                  └───────┬────────┘                          │
│                          │                                    │
│        ┌─────────────────┼──────────────────┐               │
│        │                 │                  │               │
│   ┌────▼─────┐    ┌─────▼──────┐    ┌─────▼────┐         │
│   │   Hooks  │    │  API Route │    │   Forms  │         │
│   │ (State)  │    │ (Backend)  │    │(Validation)       │
│   └────┬─────┘    └─────┬──────┘    └─────┬────┘         │
│        │                │                  │               │
│        └────────────────┼──────────────────┘              │
│                         │                                 │
│        ┌────────────────┴────────────────┐               │
│        │                                 │               │
│   ┌────▼──────────┐          ┌──────────▼────┐          │
│   │ Supabase      │          │ NextAuth.js   │          │
│   │ (Database)    │          │ (Auth)        │          │
│   └───────────────┘          └───────────────┘          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

<div align="center">

**Documentação Técnica v1.0**

Para mais detalhes, consulte [README.md](../README.md) ou [USER_GUIDE.md](USER_GUIDE.md)

</div>
