# ERP Oficina

> Sistema inteligente de gestão para oficinas mecânicas com dashboard em tempo real, controle de estoque e módulo financeiro completo.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57.0-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06b6d4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#licença)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)](#status-do-projeto)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Stack Tecnológica](#-stack-tecnológica)
- [Início Rápido](#-início-rápido)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Autores](#-autores-e-agradecimentos)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **ERP Oficina** é uma solução completa de gestão empresarial desenvolvida especificamente para oficinas mecânicas de pequeno e médio porte. Com uma interface intuitiva e funcionalidades robustas, o sistema permite gerenciar todos os aspectos operacionais da oficina em um único lugar.

### Problema que Resolve

Oficinas mecânicas tradicionalmente enfrentam desafios com:
- ❌ Planilhas desorganizadas e sem sincronização
- ❌ Dificuldade em rastrear ordens de serviço
- ❌ Controle ineficiente de estoque de peças
- ❌ Falta de visibilidade financeira
- ❌ Atendimento ao cliente desorganizado

O ERP Oficina resolve esses problemas com um sistema integrado, automatizado e em tempo real.

### Público-Alvo

- 🔧 Oficinas mecânicas (pequeno e médio porte)
- 👨‍💼 Gerentes e proprietários de oficinas
- 📋 Mecânicos e técnicos
- 💰 Departamentos financeiros/administrativos
- 👥 Atendentes e recepcionistas

### Diferenciais do Sistema

✨ **Dashboard Inteligente** - Indicadores em tempo real com gráficos analíticos  
📱 **Interface Responsiva** - Funciona perfeitamente em desktop, tablet e mobile  
🔐 **Segurança Robuста** - Autenticação segura com NextAuth.js e RLS do Supabase  
⚡ **Performance** - Aplicação otimizada com Next.js 15 e Server Components  
🎨 **Design Moderno** - Componentes acessíveis com shadcn/ui  
🌙 **Tema Escuro** - Suporte nativo para modo claro e escuro  
🌐 **Totalmente Cloud** - Infraestrutura gerenciada no Supabase  

---

## 🎬 Screenshots

> **Nota**: As capturas de tela serão adicionadas na documentação visual do projeto.
>
> - Dashboard com indicadores principais
> - Gestão de ordens de serviço
> - Cadastro e histórico de clientes
> - Controle de estoque
> - Módulo financeiro e fluxo de caixa

---

## ✨ Funcionalidades Principais

### 👥 **Gestão de Clientes**
- Cadastro completo de clientes (PF e PJ)
- Histórico de atendimentos e ordens de serviço
- Gestão de veículos associados ao cliente
- Consulta rápida de informações
- Contato integrado via email e WhatsApp

### 🔧 **Ordens de Serviço**
- Criação e gestão de ordens de serviço (O.S.)
- Sistema de status com acompanhamento em tempo real
- Orçamento dinâmico com itens e serviços
- Aprovação de orçamento pelo cliente
- Anexação de fotos e observações
- Emissão de notas fiscais integrada

### 📦 **Controle de Estoque**
- Cadastro de peças e produtos
- Movimentação de entrada e saída
- Alertas automáticos de estoque mínimo
- Rastreamento completo de histórico
- Inventário periódico com reconciliação
- Integração com fornecedores

### 💰 **Módulo Financeiro**
- Gestão de contas a receber
- Gestão de contas a pagar
- Fluxo de caixa detalhado
- Relatórios financeiros customizáveis
- Análise de inadimplência
- Projeções e tendências

### 📊 **Dashboard Executivo**
- Indicadores principais (KPIs) em tempo real
- Gráficos de faturamento mensal
- Status de ordens de serviço
- Produtos mais vendidos
- Análise de evolução de clientes
- Alertas de estoque crítico
- Previsão de contas a vencer

### 🔐 **Autenticação e Permissões**
- Autenticação segura com NextAuth.js v5
- Suporte a múltiplos provedores OAuth
- Sistema de perfis de usuário
- Controle granular de permissões (RBAC)
- Logs de auditoria de ações

---

## 🚀 Stack Tecnológica

| Categoria | Tecnologia | Versão | Finalidade |
|-----------|-----------|--------|-----------|
| **Framework** | Next.js | 15.5.7 | Framework React com SSR e App Router |
| **Linguagem** | TypeScript | 5.x | Type safety e melhor experiência de desenvolvimento |
| **Estilização** | Tailwind CSS | 4.x | Utility-first CSS framework |
| **Componentes** | shadcn/ui | - | Componentes acessíveis e customizáveis |
| **Backend** | Supabase | 2.57.0 | BaaS com PostgreSQL, Auth e Storage |
| **Autenticação** | NextAuth.js | 5.0 beta | Autenticação completa e session management |
| **Validação** | Zod + React Hook Form | 3.25 / 7.62 | Validação de schemas e formulários |
| **State & Cache** | TanStack Query | 5.85 | Gerenciamento de cache e sincronização |
| **Gráficos** | Recharts + Chart.js | - | Visualizações de dados e análises |
| **Banco de Dados** | PostgreSQL | 15.x | Banco relacional robusto no Supabase |
| **ORM/Query** | Supabase Client | - | Client para interação com Supabase |

---

## 🏃 Início Rápido

### Pré-requisitos

- **Node.js** 20.x ou superior
- **npm**, **yarn** ou **pnpm**
- **Git**
- Conta no [Supabase](https://supabase.com) (free tier disponível)
- Editor de código (VS Code recomendado)

### Instalação Rápida

```bash
# 1. Clonar o repositório
git clone https://github.com/figodevtech/erpoficina.git
cd erpoficina

# 2. Instalar dependências
npm install
# ou: yarn install | pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 4. Executar servidor de desenvolvimento
npm run dev

# 5. Abrir no navegador
# A aplicação estará disponível em http://localhost:3000
```

> 📖 Para instruções detalhadas de instalação e configuração, consulte [docs/INSTALLATION.md](docs/INSTALLATION.md)

---

## 📂 Estrutura do Projeto

```
erpoficina/
├── src/
│   ├── app/                    # Rotas e páginas (App Router)
│   │   ├── (app)/             # Área autenticada
│   │   │   ├── clientes/      # Gestão de clientes
│   │   │   ├── ordens/        # Ordens de serviço
│   │   │   ├── estoque/       # Controle de estoque
│   │   │   ├── financeiro/    # Módulo financeiro
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   └── layout.tsx     # Layout da área autenticada
│   │   ├── (pages)/           # Páginas públicas
│   │   │   ├── login/         # Autenticação
│   │   │   ├── register/      # Cadastro
│   │   │   └── layout.tsx     # Layout público
│   │   └── api/               # API Routes do Next.js
│   ├── components/            # Componentes React reutilizáveis
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── layout/           # Componentes de layout
│   │   ├── forms/            # Formulários
│   │   └── charts/           # Componentes de gráficos
│   ├── lib/                  # Funções utilitárias e serviços
│   │   ├── supabase/         # Cliente e configuração Supabase
│   │   ├── auth/             # Configuração NextAuth
│   │   └── utils.ts          # Funções auxiliares
│   ├── hooks/                # React Hooks customizados
│   ├── types/                # Definições de tipos TypeScript
│   ├── styles/               # Estilos globais
│   └── env.ts                # Validação de variáveis de ambiente
├── public/                   # Arquivos estáticos (imagens, ícones)
├── docs/                     # Documentação do projeto
│   ├── TECHNICAL.md         # Documentação técnica
│   ├── INSTALLATION.md      # Guia de instalação
│   └── USER_GUIDE.md        # Manual do usuário
├── .env.example             # Exemplo de variáveis de ambiente
├── next.config.js           # Configuração do Next.js
├── tailwind.config.ts       # Configuração do Tailwind CSS
├── tsconfig.json            # Configuração do TypeScript
└── README.md                # Este arquivo

```

---

## 📚 Documentação

- **[TECHNICAL.md](docs/TECHNICAL.md)** - Documentação técnica completa para desenvolvedores
- **[INSTALLATION.md](docs/INSTALLATION.md)** - Guia detalhado de instalação e configuração
- **[USER_GUIDE.md](docs/USER_GUIDE.md)** - Manual completo do usuário final

---

## 👥 Autores e Agradecimentos

### Desenvolvedores Principais

- **[figodevtech](https://github.com/figodevtech)** - Desenvolvedor Principal
- **[lucasrawlison](https://github.com/lucasrawlison)** - Contribuidor
- **[brunblima](https://github.com/brunblima)** - Contribuidor

### Tecnologias e Comunidades

Agradecimentos especiais às comunidades e mantenedores de:
- [Next.js](https://nextjs.org/) - Framework excepcional
- [Supabase](https://supabase.com/) - Backend como serviço
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de qualidade
- [TailwindCSS](https://tailwindcss.com/) - Utilitários CSS
- Comunidade open-source brasileira

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte e Contato

- **Issues & Bugs**: [GitHub Issues](https://github.com/figodevtech/erpoficina/issues)
- **Discussões**: [GitHub Discussions](https://github.com/figodevtech/erpoficina/discussions)
- **Email**: [suporte@erpoficina.dev](mailto:suporte@erpoficina.dev)

---

## 🌟 Dê uma Estrela!

Se este projeto foi útil para você, considere dar uma ⭐ no repositório! Isso nos motiva a continuar desenvolvendo e melhorando.

---

<div align="center">

**[⬆ Voltar ao Topo](#erp-oficina)**

Desenvolvido com ❤️ para oficinas mecânicas brasileiras

</div>
