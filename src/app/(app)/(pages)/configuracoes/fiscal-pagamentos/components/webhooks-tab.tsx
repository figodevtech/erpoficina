"use client";

import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

type FormValues = {
  empresa: any;
  nfe: any;
  nfse: any;
  pagamentos: {
    cartao: {
      webhookUrl?: string;
    };
    pix: {
      webhookUrl?: string;
    };
    dinheiro: any;
  };
};

export function WebhooksTab({
  register,
}: {
  register?: UseFormRegister<FormValues>;
  setValue?: UseFormSetValue<FormValues>;
  watch?: UseFormWatch<FormValues>;
}) {
  return (
    <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-1">
            <Label className="mb-2 block">Webhook (Cartão)</Label>
            <Input
              {...(register ? register("pagamentos.cartao.webhookUrl") : {})}
              placeholder="https://seu-dominio.com/api/webhooks/stone"
            />
          </div>
          <div className="sm:col-span-1">
            <Label className="mb-2 block">Webhook (Pix)</Label>
            <Input
              {...(register ? register("pagamentos.pix.webhookUrl") : {})}
              placeholder="https://seu-dominio.com/api/webhooks/pix"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border p-3 text-sm">
          <Info className="h-4 w-4 mt-0.5 text-primary" />
          Essas URLs também são refletidas na aba <span className="font-medium">Pagamentos</span>. Salve esta aba para persistir
          especificamente as URLs de webhook.
        </div>
      </CardContent>
    </Card>
  );
}
