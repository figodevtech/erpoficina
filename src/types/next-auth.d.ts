import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      nome: string;
      role: string;
      setorId?: number;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    nome: string;
    role: string;
    setorId?: number;
  }

  interface JWT {
    id: string;
    nome: string;
    role: string;
    setorId?: number;
  }
}