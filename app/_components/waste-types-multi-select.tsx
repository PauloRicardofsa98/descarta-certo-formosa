"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/_components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { cn } from "@/app/_lib/utils";

export type WasteTypeOption = {
  id: string;
  name: string;
};

type Props = {
  options: WasteTypeOption[];
  value: string[];
  onChange: (ids: string[]) => void;
};

export function WasteTypesMultiSelect({ options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  const selected = value
    .map((id) => options.find((option) => option.id === id))
    .filter((option): option is WasteTypeOption => Boolean(option));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              aria-expanded={open}
            >
              <span className="truncate text-left">
                {value.length === 0
                  ? "Selecione tipos aceitos..."
                  : `${value.length} ${value.length === 1 ? "tipo selecionado" : "tipos selecionados"}`}
              </span>
              <ChevronsUpDown className="size-4 opacity-60" />
            </Button>
          }
        />
        <PopoverContent
          align="start"
          className="w-[var(--anchor-width,300px)] p-0"
        >
          <Command>
            <CommandInput placeholder="Buscar tipo..." />
            <CommandList>
              <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={() => toggle(option.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {option.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((option) => (
            <li key={option.id}>
              <Badge variant="secondary" className="gap-1.5 pr-1">
                <span>{option.name}</span>
                <button
                  type="button"
                  onClick={() => toggle(option.id)}
                  aria-label={`Remover ${option.name}`}
                  className="rounded-full p-0.5 transition-colors hover:bg-foreground/10"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
