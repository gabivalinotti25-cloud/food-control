-- CreateEnum
CREATE TYPE "public"."TipoMovimiento" AS ENUM ('CARGO', 'ABONO');

-- CreateTable
CREATE TABLE "public"."MovimientoCuenta" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "public"."TipoMovimiento" NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "formaPago" "public"."FormaPago",
    "clienteId" INTEGER NOT NULL,

    CONSTRAINT "MovimientoCuenta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."MovimientoCuenta" ADD CONSTRAINT "MovimientoCuenta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "public"."Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
