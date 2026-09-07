import prisma from "../src/prisma.js";

const negocio = await prisma.negocio.update({
  where: { id: 1 },
  data: {
    plan: "ENTERPRISE",
    maxUsuarios: 99999,
    maxClientes: 99999,
    maxPedidosMes: 99999,
    maxSebastianMsg: 99999,
  },
});

console.log(`✅ Negocio "${negocio.nombre}" actualizado a plan ${negocio.plan} (sin límites)`);
await prisma.$disconnect();
