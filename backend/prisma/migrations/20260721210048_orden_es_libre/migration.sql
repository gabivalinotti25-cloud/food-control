-- AlterTable
ALTER TABLE "public"."Producto" ADD COLUMN     "esLibre" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;
