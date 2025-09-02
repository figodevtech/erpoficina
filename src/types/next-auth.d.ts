// auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      nome: string;
      role: string;
      setorId?: number;
      permissoes?: Record<string, string>; // Alterado de string[] para Record<string, string>
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    nome: string;
    role: string;
    setorId?: number;
    permissoes?: Record<string, string>; // Alterado de string[] para Record<string, string>
  }

  interface JWT {
    id: string;
    nome: string;
    role: string;
    setorId?: number;
    permissoes?: Record<string, string>; // Alterado de string[] para Record<string, string>
  }
}