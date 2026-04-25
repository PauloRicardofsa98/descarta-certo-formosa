-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ATIVO', 'INATIVO');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_de_residuo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "instrucoesPreparo" TEXT,
    "sinonimos" TEXT,
    "icone" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_de_residuo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontos_de_descarte" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "fotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "horarios" JSONB NOT NULL,
    "telefone" TEXT,
    "descricao" TEXT,
    "site" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ATIVO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pontos_de_descarte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontos_tipos" (
    "pontoId" TEXT NOT NULL,
    "tipoId" TEXT NOT NULL,

    CONSTRAINT "pontos_tipos_pkey" PRIMARY KEY ("pontoId","tipoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_de_residuo_nome_key" ON "tipos_de_residuo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_de_residuo_slug_key" ON "tipos_de_residuo"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pontos_de_descarte_slug_key" ON "pontos_de_descarte"("slug");

-- CreateIndex
CREATE INDEX "pontos_de_descarte_status_idx" ON "pontos_de_descarte"("status");

-- CreateIndex
CREATE INDEX "pontos_tipos_tipoId_idx" ON "pontos_tipos"("tipoId");

-- AddForeignKey
ALTER TABLE "pontos_tipos" ADD CONSTRAINT "pontos_tipos_pontoId_fkey" FOREIGN KEY ("pontoId") REFERENCES "pontos_de_descarte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontos_tipos" ADD CONSTRAINT "pontos_tipos_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_de_residuo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
