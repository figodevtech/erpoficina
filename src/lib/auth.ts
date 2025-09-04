// lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";           // anon: usado só para signInWithPassword
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // service role: para ler public.usuario

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Importante quando roda em dev/localhost e proxies:
  trustHost: true,

  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais ausentes");
        }

        // 1) Login no Supabase Auth (com anon key)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: String(credentials.email),
          password: String(credentials.password),
        });
        if (error || !data?.user) {
          throw new Error(error?.message || "E-mail ou senha inválidos");
        }

        const { user } = data;

        // 2) Buscar dados extras na tabela public.usuario (com service role)
        //    Evita RLS/401 no server.
        let perfilid: number | null = null;
        let setorid: number | null = null;
        let nome = user.user_metadata?.nome ?? user.email ?? "Usuário";

        try {
          // Primeiro por id (FK = auth.users.id)
          const { data: rowById, error: rowErr } = await supabaseAdmin
            .from("usuario")
            .select("id, email, nome, perfilid, setorid")
            .eq("id", user.id)
            .maybeSingle();

          if (rowErr) throw rowErr;

          if (rowById) {
            nome = rowById.nome ?? nome;
            perfilid = (rowById.perfilid as number | null) ?? null;
            setorid  = (rowById.setorid  as number | null) ?? null;
          } else {
            // Fallback por e-mail (se por algum motivo o registro ainda não existe por id)
            const { data: rowByEmail, error: rowEmailErr } = await supabaseAdmin
              .from("usuario")
              .select("id, email, nome, perfilid, setorid")
              .eq("email", user.email)
              .maybeSingle();
            if (!rowEmailErr && rowByEmail) {
              nome = rowByEmail.nome ?? nome;
              perfilid = (rowByEmail.perfilid as number | null) ?? null;
              setorid  = (rowByEmail.setorid  as number | null) ?? null;
            }
          }
        } catch {
          // Mantém login mesmo que a leitura falhe; dados mínimos vêm do Auth.
        }

        // 3) Retorna o "user" que o NextAuth usará para popular o JWT
        return {
          id: user.id,
          email: user.email!,
          nome,
          perfilId: perfilid,   // camelCase na sessão
          setorId: setorid,
        } as any;
      },
    }),
  ],

  // Callbacks para colocar os campos extras no token e na sessão
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.nome = (user as any).nome;
        token.perfilId = (user as any).perfilId ?? null;
        token.setorId = (user as any).setorId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).email = token.email as string;
        (session.user as any).nome = (token as any).nome as string;
        (session.user as any).perfilId = (token as any).perfilId ?? null;
        (session.user as any).setorId = (token as any).setorId ?? null;
      }
      return session;
    },
  },

  // Páginas custom
  pages: {
    signIn: "/login",
  },

  // Sessão por JWT
  session: {
    strategy: "jwt",
  },

  // Obrigatório no .env.local
  secret: process.env.AUTH_SECRET,
});
