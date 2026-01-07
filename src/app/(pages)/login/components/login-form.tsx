"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ForgotPasswordDialog from "./forgot-password-dialog";

type StatusImagem = "idle" | "ok" | "erro";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [forgotOpen, setForgotOpen] = useState(false);

  // Base do Supabase
  const supabaseBaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();

  // URLs (Supabase)
  const logoSrc = useMemo(() => {
    if (!supabaseBaseUrl) return "";
    try {
      return new URL(
        "/storage/v1/object/public/empresa/images/logo/logo.png",
        supabaseBaseUrl
      ).toString();
    } catch {
      return "";
    }
  }, [supabaseBaseUrl]);

  const loginBgSupabaseSrc = useMemo(() => {
    if (!supabaseBaseUrl) return "";
    try {
      return new URL(
        "/storage/v1/object/public/empresa/images/login/login.jpg",
        supabaseBaseUrl
      ).toString();
    } catch {
      return "";
    }
  }, [supabaseBaseUrl]);

  // ✅ Fallback local SOMENTE do background
  // Coloque essa imagem em /public/images/login-fallback.jpg
  const loginBgFallbackSrc = "/images/login-fallback.jpg";

  /**
   * ✅ Logo: se falhar -> some e NÃO mostra fallback
   * - começa invisível (idle)
   * - só aparece quando carregar (ok)
   * - se der erro (erro) -> não renderiza mais
   */
  const [statusLogo, setStatusLogo] = useState<StatusImagem>("idle");

  /**
   * ✅ Background: tenta Supabase, se falhar troca pro fallback local
   * - se não tiver supabase url válido, já começa no fallback
   */
  const [bgSrcAtual, setBgSrcAtual] = useState<string>(
    loginBgSupabaseSrc || loginBgFallbackSrc
  );
  const [statusBg, setStatusBg] = useState<StatusImagem>("idle");
  const [jaCaiuNoFallback, setJaCaiuNoFallback] = useState<boolean>(
    !loginBgSupabaseSrc
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Por favor, preencha e-mail e senha.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        switch (res.error) {
          case "CredentialsSignin":
          case "INVALID_CREDENTIALS":
            toast.error("E-mail ou senha inválidos.");
            break;

          case "CallbackRouteError":
          case "USER_BLOCKED":
            toast.error(
              "Seu usuário foi bloqueado. Entre em contato com o administrador do sistema."
            );
            break;

          case "MISSING_CREDENTIALS":
          case "Por favor, forneça e-mail e senha.":
            toast.error("Por favor, preencha e-mail e senha.");
            break;

          case "USER_NOT_FOUND":
          case "Usuário não encontrado no sistema.":
            toast.error("Usuário não encontrado. Solicite um cadastro.");
            break;

          case "LOGIN_INTERNAL_ERROR":
            toast.error("Ocorreu um erro ao tentar fazer login. Tente novamente.");
            break;

          default:
            toast.error("Não foi possível fazer login. Tente novamente.");
            break;
        }

        return;
      }

      toast.success("Login efetuado!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e?.message || "Falha de login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                <p className="text-muted-foreground text-balance">
                  Conectar ao ERP
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>

                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <button
                type="button"
                className="text-xs underline underline-offset-4 text-muted-foreground hover:text-primary"
                onClick={() => setForgotOpen(true)}
              >
                Esqueci minha senha
              </button>
            </div>
          </form>

          <div className="bg-muted relative hidden overflow-hidden md:block group">
            {/* Logo: NÃO tem fallback — se falhar, não aparece */}
            <div className="w-full absolute z-20 h-full flex p-6 justify-center">
              {!!logoSrc && statusLogo !== "erro" && (
                <Image
                  width={480}
                  height={480}
                  src={logoSrc}
                  alt="logo"
                  className={cn(
                    "absolute object-cover w-[120px] transition-all",
                    statusLogo === "ok"
                      ? "opacity-85 group-hover:opacity-95"
                      : "opacity-0"
                  )}
                  onLoadingComplete={() => setStatusLogo("ok")}
                  onError={() => setStatusLogo("erro")}
                />
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-blue-800/50 to-cyan-300/10 z-10" />

            {/* Background: com fallback local */}
            <Image
              width={720}
              height={720}
              src={bgSrcAtual}
              alt="imagem_login"
              className={cn(
                "absolute h-full w-full object-cover scale-150 transition-opacity",
                statusBg === "ok" ? "opacity-100" : "opacity-0"
              )}
              onLoadingComplete={() => setStatusBg("ok")}
              onError={() => {
                // Se falhar no Supabase, troca pro fallback e tenta de novo
                if (!jaCaiuNoFallback) {
                  setJaCaiuNoFallback(true);
                  setStatusBg("idle");
                  setBgSrcAtual(loginBgFallbackSrc);
                  return;
                }
                // Se até o fallback falhar, só não mostra
                setStatusBg("erro");
              }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Ao continuar você concorda com os <a href="#">Termos de Serviço</a> e a{" "}
        <a href="#">Política de Privacidade</a>.
      </div>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  );
}
