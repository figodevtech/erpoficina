import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciais ausentes");
        }

        // Autenticar no Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (error || !data.user) {
          throw new Error(error?.message || "E-mail ou senha inválidos");
        }

        // Buscar informações extras do usuário
        const { data: userData } = await supabase
          .from("Usuario")
          .select("id, email, nome, role, setorId")
          .eq("id", data.user.id)
          .single();

        return {
          id: userData?.id ?? data.user.id,
          email: userData?.email ?? data.user.email,
          nome: userData?.nome ?? data.user.email,
          role: userData?.role ?? "user",
          setorId: userData?.setorId ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nome = user.nome;
        token.role = user.role;
        token.setorId = user.setorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nome = token.nome as string;
        session.user.role = token.role as string;
        session.user.setorId = token.setorId !== null ? token.setorId as number : undefined;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});
