import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Página Não Encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            A página que você está tentando acessar não existe.
          </p>
          <Button asChild>
            <Link href="/app/dashboard">Voltar ao Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}