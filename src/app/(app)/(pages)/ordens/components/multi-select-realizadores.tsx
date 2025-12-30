import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type UsuarioAtivo = { id: string; nome: string | null };

export function MultiSelectRealizadores({
  disabled,
  responsaveis,
  valueIds,
  onChangeIds,
}: {
  disabled?: boolean;
  responsaveis: UsuarioAtivo[];
  valueIds: string[];
  onChangeIds: (nextIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(() => new Set(valueIds), [valueIds]);

  const label = valueIds.length === 0 ? "Sem realizador" : `${valueIds.length} selecionado(s)`;

  function toggle(id: string) {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChangeIds(Array.from(next));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled} className="h-8 justify-between">
          <span className="truncate">Realizadores: {label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Buscar usuário..." />
          <CommandList>
            <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
            <CommandGroup>
              {responsaveis.map((u) => {
                const checked = selectedSet.has(u.id);
                return (
                  <CommandItem
                    key={u.id}
                    value={(u.nome ?? u.id) + " " + u.id}
                    onSelect={() => toggle(u.id)}
                    className="flex items-center gap-2"
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggle(u.id)} />
                    <span className={cn("truncate", checked && "font-medium")}>{u.nome ?? u.id}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        {valueIds.length > 0 && (
          <div className="border-t p-2 flex flex-wrap gap-1">
            {valueIds.slice(0, 6).map((id) => {
              const nome = responsaveis.find((r) => r.id === id)?.nome ?? id;
              return (
                <Badge key={id} variant="secondary" className="truncate max-w-[140px]">
                  {nome}
                </Badge>
              );
            })}
            {valueIds.length > 6 && <Badge variant="outline">+{valueIds.length - 6}</Badge>}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
