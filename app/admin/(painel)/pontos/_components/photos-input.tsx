"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/app/_components/ui/button";
import { UploadDropzone } from "@/app/_lib/uploadthing";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
};

export function PhotosInput({ value, onChange }: Props) {
  const remaining = 3 - value.length;

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
            >
              <Image
                src={url}
                alt={`Foto ${index + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover"
                unoptimized
              />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute right-1 top-1"
                onClick={() => onChange(value.filter((u) => u !== url))}
                aria-label={`Remover foto ${index + 1}`}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 ? (
        <UploadDropzone
          endpoint="pointPhotos"
          appearance={{
            container:
              "border border-dashed border-border rounded-md p-6 ut-uploading:opacity-70",
            uploadIcon: "text-muted-foreground",
            label: "text-foreground",
            allowedContent: "text-muted-foreground text-xs",
            button:
              "bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded-md text-sm font-medium ut-uploading:opacity-50",
          }}
          content={{
            label: ({ isDragActive }) =>
              isDragActive
                ? "Solte aqui para enviar"
                : `Arraste imagens ou clique para selecionar (${remaining} restante${remaining > 1 ? "s" : ""})`,
            allowedContent: ({ ready }) =>
              ready ? "PNG, JPG ou WebP até 4 MB" : "Carregando...",
          }}
          onClientUploadComplete={(res) => {
            const urls = res.map((file) => file.ufsUrl);
            onChange([...value, ...urls].slice(0, 3));
            toast.success("Foto enviada com sucesso.");
          }}
          onUploadError={(error) => {
            toast.error(`Falha no upload: ${error.message}`);
          }}
          config={{ mode: "auto" }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Limite de 3 fotos atingido. Remova uma foto para enviar outra.
        </p>
      )}
    </div>
  );
}
