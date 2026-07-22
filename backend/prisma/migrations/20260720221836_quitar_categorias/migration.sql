/*
  Warnings:

  - You are about to drop the column `observacion` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `PedidoDetalle` table. All the data in the column will be lost.
  - You are about to drop the column `categoriaId` on the `Producto` table. All the data in the column will be lost.
  - You are about to drop the `Categoria` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Producto" DROP CONSTRAINT "Producto_categoriaId_fkey";

-- AlterTable
ALTER TABLE "public"."Pedido" DROP COLUMN "observacion";

-- AlterTable
ALTER TABLE "public"."PedidoDetalle" DROP COLUMN "tipo";

-- AlterTable
ALTER TABLE "public"."Producto" DROP COLUMN "categoriaId";

-- DropTable
DROP TABLE "public"."Categoria";

-- DropEnum
DROP TYPE "public"."TipoDetallePedido";
