-- AlterTable
ALTER TABLE "public"."Producto" ADD COLUMN     "esEspecial" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."VentaAnonima" (
    "id" SERIAL NOT NULL,
    "monto" INTEGER NOT NULL,
    "descripcion" TEXT,
    "formaPago" "public"."FormaPago" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VentaAnonima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CajaDiaria" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "montoEfectivoEsperado" INTEGER NOT NULL DEFAULT 0,
    "montoTransferenciaEsperado" INTEGER NOT NULL DEFAULT 0,
    "montoEfectivoReal" INTEGER NOT NULL DEFAULT 0,
    "montoTransferenciaReal" INTEGER NOT NULL DEFAULT 0,
    "observacion" TEXT,
    "cerrada" BOOLEAN NOT NULL DEFAULT false,
    "fechaCierre" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CajaDiaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConfiguracionMenu" (
    "id" SERIAL NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "productosFijos" BOOLEAN NOT NULL DEFAULT true,
    "cantidadMaxEspeciales" INTEGER NOT NULL DEFAULT 2,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionMenu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CajaDiaria_fecha_key" ON "public"."CajaDiaria"("fecha");
