-- CreateEnum
CREATE TYPE "public"."TipoDetallePedido" AS ENUM ('PRODUCTO', 'CONCEPTO_LIBRE');

-- AlterTable
ALTER TABLE "public"."Pedido" ADD COLUMN     "observacion" TEXT;

-- CreateTable
CREATE TABLE "public"."Producto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "precio" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PedidoDetalle" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "tipo" "public"."TipoDetallePedido" NOT NULL DEFAULT 'PRODUCTO',
    "productoId" INTEGER,
    "descripcion" TEXT,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,

    CONSTRAINT "PedidoDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MenuPlantilla" (
    "id" SERIAL NOT NULL,
    "diaSemana" INTEGER NOT NULL,

    CONSTRAINT "MenuPlantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MenuPlantillaDetalle" (
    "id" SERIAL NOT NULL,
    "menuId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "MenuPlantillaDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MenuDiario" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuDiario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MenuDiarioDetalle" (
    "id" SERIAL NOT NULL,
    "menuId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "MenuDiarioDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuDiario_fecha_key" ON "public"."MenuDiario"("fecha");

-- AddForeignKey
ALTER TABLE "public"."PedidoDetalle" ADD CONSTRAINT "PedidoDetalle_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "public"."Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PedidoDetalle" ADD CONSTRAINT "PedidoDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."Producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuPlantillaDetalle" ADD CONSTRAINT "MenuPlantillaDetalle_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."MenuPlantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuPlantillaDetalle" ADD CONSTRAINT "MenuPlantillaDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuDiarioDetalle" ADD CONSTRAINT "MenuDiarioDetalle_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "public"."MenuDiario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MenuDiarioDetalle" ADD CONSTRAINT "MenuDiarioDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
