import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LoginForm } from "./components/login-form";
import { TabsTrigger } from "@/components/ui/tabs";

export default async function LoginPage() {
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/quote`, {
    next: { revalidate: 60 * 60 * 24 }, // 24h
  });
  const { text, author, obs } = await r.json();

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
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
