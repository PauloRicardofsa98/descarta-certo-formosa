import { ArrowLeft, ExternalLink, Globe, MapPin, Navigation, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { HoursDisplay } from "@/app/_components/hours-display";
import { PointMiniMap } from "@/app/_components/point-mini-map";
import { trackView } from "@/app/_lib/analytics";
import { type Hours } from "@/app/_lib/hours";
import { prisma } from "@/app/_lib/db";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const point = await prisma.disposalPoint.findUnique({
    where: { slug },
    select: { name: true, description: true, status: true },
  });
  if (!point || point.status === "INACTIVE") {
    return { title: "Ponto não encontrado" };
  }
  return {
    title: point.name,
    description:
      point.description ?? `Ponto de descarte em Formosa-GO: ${point.name}.`,
  };
}

function buildDirectionsUrl(point: {
  latitude: number | null;
  longitude: number | null;
  address: string;
}): string {
  if (point.latitude !== null && point.longitude !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point.address)}`;
}

export default async function DisposalPointPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const point = await prisma.disposalPoint.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      photos: true,
      hours: true,
      phone: true,
      description: true,
      website: true,
      status: true,
      wasteTypes: {
        select: { wasteType: { select: { name: true, slug: true } } },
        orderBy: { wasteType: { order: "asc" } },
      },
    },
  });

  if (!point || point.status === "INACTIVE") {
    notFound();
  }

  await trackView({
    path: `/pontos/${slug}`,
    pointId: point.id,
  });

  const hours = point.hours as Hours;
  const directionsUrl = buildDirectionsUrl(point);
  const hasGeo = point.latitude !== null && point.longitude !== null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Button
        render={<Link href="/" />}
        nativeButton={false}
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Voltar para a home
      </Button>

      {point.photos.length > 0 && (
        <div
          className={`mt-6 grid gap-2 ${
            point.photos.length === 1
              ? "grid-cols-1"
              : point.photos.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {point.photos.map((photoUrl, index) => (
            <div
              key={photoUrl}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
            >
              <Image
                src={photoUrl}
                alt={`Foto ${index + 1} de ${point.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      <header className="mt-6 sm:mt-8">
        <h1 className="font-heading text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {point.name}
        </h1>
        <p className="mt-2 flex items-start gap-2 text-base text-muted-foreground">
          <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{point.address}</span>
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <HoursDisplay hours={hours} />

          {(point.phone || point.website || point.description) && (
            <section
              aria-labelledby="contact-heading"
              className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <h2
                id="contact-heading"
                className="font-heading text-base font-semibold text-foreground"
              >
                Contato e observações
              </h2>
              <dl className="space-y-3 text-sm">
                {point.phone && (
                  <div className="flex items-start gap-2">
                    <Phone aria-hidden className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <dt className="sr-only">Telefone</dt>
                      <dd>
                        <a
                          href={`tel:${point.phone.replace(/\D/g, "")}`}
                          className="text-primary outline-none hover:underline focus-visible:underline"
                        >
                          {point.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {point.website && (
                  <div className="flex items-start gap-2">
                    <Globe aria-hidden className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <dt className="sr-only">Site</dt>
                      <dd>
                        <a
                          href={point.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary outline-none hover:underline focus-visible:underline"
                        >
                          {point.website}
                          <ExternalLink aria-hidden className="size-3.5" />
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {point.description && (
                  <div>
                    <dt className="sr-only">Observações</dt>
                    <dd className="leading-relaxed text-foreground/90">
                      {point.description}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {point.wasteTypes.length > 0 && (
            <section
              aria-labelledby="waste-types-heading"
              className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <h2
                id="waste-types-heading"
                className="font-heading text-base font-semibold text-foreground"
              >
                Aceita os seguintes resíduos
              </h2>
              <ul className="flex flex-wrap gap-1.5">
                {point.wasteTypes.map(({ wasteType }) => (
                  <li key={wasteType.slug}>
                    <Link
                      href={`/tipos/${wasteType.slug}`}
                      className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        {wasteType.name}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-3">
          {hasGeo && (
            <PointMiniMap
              latitude={point.latitude!}
              longitude={point.longitude!}
              pointName={point.name}
              className="aspect-square w-full overflow-hidden rounded-xl border border-border lg:aspect-[3/4]"
            />
          )}
          <Button
            render={
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
            size="lg"
            className="h-12 w-full"
          >
            <Navigation aria-hidden className="size-4" />
            Como chegar
          </Button>
          {!hasGeo && (
            <p className="text-xs text-muted-foreground">
              Localização exata não cadastrada. O destino será o endereço
              acima.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
