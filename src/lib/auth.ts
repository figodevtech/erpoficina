import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

          const agora = new Date();
          console.log("[auth] login realizado no servidor", {
            iso: agora.toISOString(),
            local: agora.toString(),
          });

          let perfilid: number | null = null;
          let setorid: number | null = null;
          let nome = user.user_metadata?.nome ?? user.email ?? "Usuário";

          const { data: row } = await supabaseAdmin
            .from("usuario")
            .select("id, email, nome, perfilid, setorid, ativo")
            .eq("id", user.id)
            .maybeSingle();

          if (row) {
            nome = row.nome ?? nome;
            perfilid = (row.perfilid as number | null) ?? null;
            setorid = (row.setorid as number | null) ?? null;

            if (row.ativo === false) {
              // 👇 código de usuário bloqueado
              throw new Error("USER_BLOCKED");
            }
          } else {
            const { data: byEmail } = await supabaseAdmin
              .from("usuario")
              .select("id, email, nome, perfilid, setorid, ativo")
              .eq("email", user.email)
              .maybeSingle();

            if (byEmail) {
              nome = byEmail.nome ?? nome;
              perfilid = (byEmail.perfilid as number | null) ?? null;
              setorid = (byEmail.setorid as number | null) ?? null;

              if (byEmail.ativo === false) {
                throw new Error("USER_BLOCKED");
              }
            }
          }

          return {
            id: user.id,
            email: user.email!,
            nome,
            perfilId: perfilid,
            setorId: setorid,
          } as any;
        } catch (e: any) {
          // Se já for um dos códigos conhecidos, só repassa
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
  callbacks: {
    async jwt({ token, user }) {
      // Primeira vez: quando acabou de logar
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        (token as any).nome = (user as any).nome;
        (token as any).perfilId = (user as any).perfilId ?? null;
        (token as any).setorId = (user as any).setorId ?? null;
        (token as any).ativo = true; // assume ativo no login
        return token;
      }

      // Chamadas subsequentes: revalida no banco
      if (token.id) {
        const { data: row, error } = await supabaseAdmin
          .from("usuario")
          .select("id, ativo")
          .eq("id", token.id as string)
          .maybeSingle();

        if (error) {
          // em caso de erro, mantém token por enquanto
          return token;
        }

        if (row && row.ativo === false) {
          // Invalida completamente o token -> sessão some e cookie é limpo
          return null;
        }

        (token as any).ativo = row?.ativo ?? true;
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
        (session.user as any).ativo = (token as any).ativo ?? true;
      }

      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
