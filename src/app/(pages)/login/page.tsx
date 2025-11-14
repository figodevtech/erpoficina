import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LoginForm } from "./components/login-form";
import { getQuoteOfTheDay } from "@/lib/quotes";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const { text, author, obs } = getQuoteOfTheDay();
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }
  
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
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
