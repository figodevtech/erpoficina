"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ForgotPasswordDialog from "./forgot-password-dialog";

/**
 * Checa existência da URL evitando cache (quando possível).
 * Alguns servidores não suportam HEAD (405) ou bloqueiam (403) — nesse caso tenta GET.
 */
async function urlExiste(url: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const head = await fetch(url, { method: "HEAD", cache: "no-store", signal });
    if (head.ok) return true;

    if (head.status === 405 || head.status === 403) {
      const get = await fetch(url, { method: "GET", cache: "no-store", signal });
      return get.ok;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Pré-carrega imagem no browser sem renderizar.
 * Assim você evita mostrar fallback “primeiro” e trocar depois.
 */
function preloadImage(src: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    // Em SSR não existe window/Image
    if (typeof window === "undefined") return resolve();

    const img = new window.Image();
    img.decoding = "async";

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
    };

    const onAbort = () => {
      cleanup();
      reject(new Error("abort"));
    };

    if (signal) {
      if (signal.aborted) return onAbort();
      signal.addEventListener("abort", onAbort, { once: true });
    }

    img.onload = () => {
      cleanup();
      resolve();
    };

    img.onerror = () => {
      cleanup();
      reject(new Error("error"));
    };

    img.src = src;
  });
}

type BgState = "loading" | "ready" | "hidden";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [forgotOpen, setForgotOpen] = useState(false);

  // Base do Supabase
  const supabaseBaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();

  // URLs (Supabase) montadas com segurança
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

  /**
   * ✅ Fallback local SOMENTE para o background
   * Coloque em: /public/images/login-fallback.jpg
   */
  const loginBgFallbackSrc = "/images/login-fallback.jpg";

  /**
   * ✅ Logo: só renderiza se for válida (sem fallback)
   */
  const [logoOk, setLogoOk] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function validarLogo() {
      if (!logoSrc) {
        setLogoOk(false);
        return;
      }
      const existe = await urlExiste(logoSrc, controller.signal);
      if (controller.signal.aborted) return;
      setLogoOk(existe);
    }

    validarLogo();
    return () => controller.abort();
  }, [logoSrc]);

  /**
   * ✅ Background sem "troca feia":
   * - Enquanto decide/carrega, não mostra imagem (só bg-muted + gradiente).
   * - Se Supabase existir: pré-carrega e só então exibe.
   * - Se não existir/falhar: pré-carrega fallback e exibe.
   */
  const [bgSrc, setBgSrc] = useState<string>("");
  const [bgState, setBgState] = useState<BgState>("loading");

  useEffect(() => {
    const controller = new AbortController();
    let ativo = true;

    async function resolverBackground() {
      setBgState("loading");
      setBgSrc("");

      // 1) Se não tem URL de supabase, vai direto pro fallback (sem piscar)
      if (!loginBgSupabaseSrc) {
        try {
          await preloadImage(loginBgFallbackSrc, controller.signal);
          if (!ativo || controller.signal.aborted) return;
          setBgSrc(loginBgFallbackSrc);
          setBgState("ready");
        } catch {
          if (!ativo || controller.signal.aborted) return;
          setBgState("hidden");
        }
        return;
      }

      // 2) Se tem URL, valida se existe de verdade
      const existe = await urlExiste(loginBgSupabaseSrc, controller.signal);
      if (!ativo || controller.signal.aborted) return;

      // 3) Se existe: pré-carrega Supabase e só então mostra
      if (existe) {
        try {
          await preloadImage(loginBgSupabaseSrc, controller.signal);
          if (!ativo || controller.signal.aborted) return;
          setBgSrc(loginBgSupabaseSrc);
          setBgState("ready");
          return;
        } catch {
          // falhou no preload -> cai pro fallback
        }
      }

      // 4) Fallback (só aparece aqui se supabase não existir ou falhou)
      try {
        await preloadImage(loginBgFallbackSrc, controller.signal);
        if (!ativo || controller.signal.aborted) return;
        setBgSrc(loginBgFallbackSrc);
        setBgState("ready");
      } catch {
        if (!ativo || controller.signal.aborted) return;
        setBgState("hidden");
      }
    }

    resolverBackground();

    return () => {
      ativo = false;
      controller.abort();
    };
  }, [loginBgSupabaseSrc, loginBgFallbackSrc]);

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
            {/* Logo: SEM fallback — só aparece se for válida */}
            <div className="w-full absolute z-20 h-full flex p-6 justify-center">
              {logoOk && !!logoSrc && (
                <Image
                  width={480}
                  height={480}
                  src={logoSrc}
                  alt="logo"
                  className="absolute object-cover w-[120px] opacity-85 group-hover:opacity-95 transition-all"
                  unoptimized
                  onError={() => setLogoOk(false)}
                />
              )}
            </div>

            {/* Gradiente sempre presente */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-800/50 to-cyan-300/10 z-10" />

            {/* Background: só aparece quando estiver pronto (supabase OU fallback) */}
            {bgState === "ready" && !!bgSrc && (
              <Image
                key={bgSrc}
                width={720}
                height={720}
                src={bgSrc}
                alt="imagem_login"
                className="absolute h-full w-full object-cover scale-150"
                unoptimized
                onError={() => {
                  // Se por algum motivo der erro mesmo após preload, esconde
                  setBgState("hidden");
                }}
              />
            )}
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
