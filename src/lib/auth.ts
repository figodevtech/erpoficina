// src/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h

async function carregarPermissoesPorPerfil(perfilId: number | null): Promise<string[]> {
  if (!perfilId) return [];

  const { data, error } = await supabaseAdmin
    .from("perfilpermissao")
    .select("permissao:permissaoid ( nome )")
    .eq("perfilid", perfilId);

  if (error) {
    console.error("[auth] erro ao carregar permissões:", error);
    return [];
  }

  return (data ?? [])
    .map((r: any) =>
      String(r?.permissao?.nome ?? "")
        .trim()
        .toUpperCase()
    )
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("MISSING_CREDENTIALS");
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email: String(credentials.email),
            password: String(credentials.password),
          });

          if (error || !data?.user) {
            throw new Error("INVALID_CREDENTIALS");
          }

          const { user } = data;

          let perfilid: number | null = null;
          let setorid: number | null = null;
          let nome = user.user_metadata?.nome ?? user.email ?? "Usuário";
          let ativo = true;

          // tenta por id
          const { data: row } = await supabaseAdmin
            .from("usuario")
            .select("id, email, nome, perfilid, setorid, ativo")
            .eq("id", user.id)
            .maybeSingle();

          if (row) {
            nome = row.nome ?? nome;
            perfilid = (row.perfilid as number | null) ?? null;
            setorid = (row.setorid as number | null) ?? null;
            ativo = row.ativo !== false;
          } else {
            // fallback por email
            const { data: byEmail } = await supabaseAdmin
              .from("usuario")
              .select("id, email, nome, perfilid, setorid, ativo")
              .eq("email", user.email)
              .maybeSingle();

            if (byEmail) {
              nome = byEmail.nome ?? nome;
              perfilid = (byEmail.perfilid as number | null) ?? null;
              setorid = (byEmail.setorid as number | null) ?? null;
              ativo = byEmail.ativo !== false;
            }
          }

          if (!ativo) {
            throw new Error("USER_BLOCKED");
          }

          const permissoes = await carregarPermissoesPorPerfil(perfilid);

          return {
            id: user.id,
            email: user.email!,
            nome,
            perfilId: perfilid,
            setorId: setorid,
            ativo,
            permissoes,
          } as any;
        } catch (e: any) {
          if (
            e instanceof Error &&
            ["MISSING_CREDENTIALS", "INVALID_CREDENTIALS", "USER_BLOCKED"].includes(e.message)
          ) {
            throw e;
          }

          console.error(e);
          throw new Error("LOGIN_INTERNAL_ERROR");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: MAX_AGE_SECONDS,
  },

  jwt: {
    maxAge: MAX_AGE_SECONDS,
  },

  callbacks: {
    async jwt({ token, user }) {
      // Primeira vez (login)
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;

        (token as any).nome = (user as any).nome;
        (token as any).perfilId = (user as any).perfilId ?? null;
        (token as any).setorId = (user as any).setorId ?? null;

        (token as any).ativo = (user as any).ativo ?? true;
        (token as any).permissoes = Array.isArray((user as any).permissoes) ? (user as any).permissoes : [];

        return token;
      }

      // Depois do login: não bater no banco (edge-safe e rápido)
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).email = token.email as string;

        (session.user as any).nome = (token as any).nome as string;
        (session.user as any).perfilId = (token as any).perfilId ?? null;
        (session.user as any).setorId = (token as any).setorId ?? null;

        (session.user as any).ativo = (token as any).ativo ?? true;
        (session.user as any).permissoes = (token as any).permissoes ?? [];
      }

      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.AUTH_SECRET,
});
