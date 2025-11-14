// src/app/(page)/recuperar-senha/sucesso/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogIn } from "lucide-react";

export default function SucessoRecuperarSenhaPage() {
  const router = useRouter();

  return (
    <div className="min-h-[100svh] grid place-items-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <CardTitle>Senha alterada com sucesso</CardTitle>
          </div>
          <CardDescription>
            Você já pode entrar no sistema usando sua nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => router.push("/login")}>
            <LogIn className="h-4 w-4 mr-2" />
            Ir para o login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
