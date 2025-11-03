// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      nome?: string | null;
      perfilId?: number | null;
      setorId?: number | null;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    image?: string | null;
    nome?: string | null;
    perfilId?: number | null;
    setorId?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    nome?: string | null;
    perfilId?: number | null;
    setorId?: number | null;
  }
}
