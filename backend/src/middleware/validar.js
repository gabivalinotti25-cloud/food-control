import { z } from "zod";

// Middleware genérico de validación con zod
// Uso: router.post("/", validar(schema), controller)
export function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      const errores = resultado.error.issues.map((i) => ({
        campo: i.path.join("."),
        mensaje: i.message,
      }));
      return res.status(400).json({ error: "Datos inválidos", detalles: errores });
    }
    req.body = resultado.data;
    next();
  };
}

// ============ Schemas ============

const passwordSegura = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir mayúscula")
  .regex(/[a-z]/, "Debe incluir minúscula")
  .regex(/[0-9]/, "Debe incluir número")
  .regex(/[^a-zA-Z0-9]/, "Debe incluir símbolo");

export const schemaLogin = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const schemaRegistrarUsuario = z.object({
  email: z.string().email("Email inválido"),
  password: passwordSegura,
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  rol: z.enum(["ADMIN", "EMPLEADO"]).optional(),
});

export const schemaRegistrarNegocio = z.object({
  nombre: z.string().trim().min(1, "El nombre del negocio es obligatorio"),
  email: z.string().email("Email del negocio inválido"),
  telefono: z.string().trim().optional(),
  direccion: z.string().trim().optional(),
  adminNombre: z.string().trim().min(1, "El nombre del admin es obligatorio"),
  adminEmail: z.string().email("Email del admin inválido"),
  adminPassword: passwordSegura,
});

export const schemaCrearFacturaAdmin = z.object({
  negocioId: z.number().int().positive("negocioId inválido"),
  concepto: z.string().trim().min(1, "El concepto es obligatorio"),
  monto: z.number().positive("El monto debe ser mayor a 0"),
  diasVencimiento: z.number().int().min(1).max(90).optional(),
});

export const schemaCrearCliente = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  telefono: z.string().trim().optional(),
  direccion: z.string().trim().optional(),
});

export const schemaCrearProducto = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  precio: z.number().nonnegative("El precio no puede ser negativo"),
  categoriaId: z.number().int().optional(),
});
