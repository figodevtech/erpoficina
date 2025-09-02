"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PatioDemir from "@/lib/images/Patio_Demir-Injecao-Eletronica-Diesel-scaled.jpg";
import DemirLogo from "@/lib/images/demirLogo.png";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? "E-mail ou senha inválidos" : res.error);
    } else {
      router.push("/app/dashboard");
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
                <p className="text-muted-foreground text-balance">Conectar ao ERP</p>
              </div>
              {error && <p className="text-destructive text-center">{error}</p>}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Solicite um cadastro.
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden overflow-hidden md:block group">
            <div className="w-full absolute z-20 h-full flex p-6 justify-center">
              <Image
                src={DemirLogo}
                alt="Patio Demir - Injeção Eletrônica Diesel"
                className="absolute object-cover w-[120px] opacity-85 group-hover:opacity-95 transition-all"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-800/50 to-cyan-300/10 z-10"></div>
            <Image
              src={PatioDemir}
              alt="Patio Demir - Injeção Eletrônica Diesel"
              className="absolute h-full w-full object-cover scale-150"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Clicando em continuar você estará sujeito aos <a href="#">Termos de Serviço</a> e a{" "}
        <a href="#">Política de Privacidade</a>.
      </div>
    </div>
  );
}
