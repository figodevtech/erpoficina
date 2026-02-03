import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LoginForm } from "./components/login-form";
import { getQuoteOfTheDay } from "@/lib/quotes";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ForceLogout } from "./components/force-logout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  // Next 15: searchParams pode ser assíncrono em rotas dinâmicas
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { text, author, obs } = getQuoteOfTheDay();
  const session = await auth();
  const sp = (await searchParams) ?? {};
  const reason = Array.isArray(sp.reason) ? sp.reason[0] : sp.reason;

  // Quando o usuário foi bloqueado, a página de login deve derrubar a sessão em vez de redirecionar.
  if (session && reason !== "inactive") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      {reason === "inactive" ? <ForceLogout reason="inactive" /> : null}
      <span className="mb-4 text-xs text-muted-foreground">
        <blockquote className="hover:cursor-default">
          {`"${text}" - `}
          <Tooltip>
            <TooltipTrigger asChild>
              <span> {author}</span>
            </TooltipTrigger>
            <TooltipContent>{obs}</TooltipContent>
          </Tooltip>
        </blockquote>
      </span>

      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  );
}
