import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";          
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // service role: ler public.usuario

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais ausentes");
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: String(credentials.email),
          password: String(credentials.password),
        });
        if (error || !data?.user) throw new Error(error?.message || "E-mail ou senha inválidos");

        const { user } = data;
        let perfilid: number | null = null;
        let setorid: number | null = null;
        let nome = user.user_metadata?.nome ?? user.email ?? "Usuário";

        try {
          const { data: row } = await supabaseAdmin
            .from("usuario")
            .select("id, email, nome, perfilid, setorid")
            .eq("id", user.id)
            .maybeSingle();

          if (row) {
            nome = row.nome ?? nome;
            perfilid = (row.perfilid as number | null) ?? null;
            setorid  = (row.setorid  as number | null) ?? null;
          } else {
            const { data: byEmail } = await supabaseAdmin
              .from("usuario")
              .select("id, email, nome, perfilid, setorid")
              .eq("email", user.email)
              .maybeSingle();
            if (byEmail) {
              nome = byEmail.nome ?? nome;
              perfilid = (byEmail.perfilid as number | null) ?? null;
              setorid  = (byEmail.setorid  as number | null) ?? null;
            }
          }
        } catch {}

        return { id: user.id, email: user.email!, nome, perfilId: perfilid, setorId: setorid } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        (token as any).nome = (user as any).nome;
        (token as any).perfilId = (user as any).perfilId ?? null;
        (token as any).setorId = (user as any).setorId ?? null;
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
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
