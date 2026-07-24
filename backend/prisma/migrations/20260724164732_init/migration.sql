-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'EMPLEADO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT,
    "observacion" TEXT,
    "saldo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precio" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esLibre" BOOLEAN NOT NULL DEFAULT false,
    "esFijo" BOOLEAN NOT NULL DEFAULT false,
    "esEspecial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "estadoPago" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "clienteId" INTEGER NOT NULL,
    CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PedidoDetalle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pedidoId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "descripcion" TEXT,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    CONSTRAINT "PedidoDetalle_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PedidoDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monto" INTEGER NOT NULL,
    "forma" TEXT NOT NULL,
    "fechaPago" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pedidoId" INTEGER NOT NULL,
    CONSTRAINT "Pago_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoCuenta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" INTEGER NOT NULL,
    "formaPago" TEXT,
    "clienteId" INTEGER NOT NULL,
    CONSTRAINT "MovimientoCuenta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuPlantilla" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "diaSemana" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "MenuPlantillaDetalle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    CONSTRAINT "MenuPlantillaDetalle_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuPlantilla" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuPlantillaDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MenuDiario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MenuDiarioDetalle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "menuId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    CONSTRAINT "MenuDiarioDetalle_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuDiario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuDiarioDetalle_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VentaAnonima" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monto" INTEGER NOT NULL,
    "descripcion" TEXT,
    "formaPago" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CajaDiaria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "montoEfectivoEsperado" INTEGER NOT NULL DEFAULT 0,
    "montoTransferenciaEsperado" INTEGER NOT NULL DEFAULT 0,
    "montoEfectivoReal" INTEGER NOT NULL DEFAULT 0,
    "montoTransferenciaReal" INTEGER NOT NULL DEFAULT 0,
    "observacion" TEXT,
    "cerrada" BOOLEAN NOT NULL DEFAULT false,
    "fechaCierre" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConfiguracionMenu" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "diaSemana" INTEGER NOT NULL,
    "productosFijos" BOOLEAN NOT NULL DEFAULT true,
    "cantidadMaxEspeciales" INTEGER NOT NULL DEFAULT 2,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_telefono_key" ON "Cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_pedidoId_key" ON "Pago"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuDiario_fecha_key" ON "MenuDiario"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CajaDiaria_fecha_key" ON "CajaDiaria"("fecha");
