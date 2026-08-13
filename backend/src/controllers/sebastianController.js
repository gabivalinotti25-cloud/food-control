import dotenv from "dotenv";
dotenv.config();
import prisma from "../prisma.js";
import ollama from "ollama";
import Groq from "groq-sdk";
import twilio from "twilio";
import { notificar } from "./notificacionesController.js";

// Configuración de Twilio (solo si están configuradas las credenciales válidas)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN &&
    !process.env.TWILIO_ACCOUNT_SID.includes('tu_') &&
    !process.env.TWILIO_AUTH_TOKEN.includes('tu_')) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio inicializado correctamente');
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar Twilio:', error.message);
  }
} else {
  console.log('ℹ️ Twilio no configurado (credenciales no válidas o no proporcionadas)');
}

// Configuración de Groq (para producción)
let groqClient = null;
console.log('🔍 Verificando GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Presente' : 'Ausente');
if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('tu_')) {
  try {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log('✅ Groq inicializado correctamente');
  } catch (error) {
    console.warn('⚠️ No se pudo inicializar Groq:', error.message);
  }
} else {
  console.log('ℹ️ Groq no configurado (usando Ollama local)');
}

const SYSTEM_PROMPT = `Eres Sebastian, un asistente para un sistema de control de comida. Analiza el mensaje del usuario y responde SOLO en JSON válido.

ACCIONES DISPONIBLES:
- crear_cliente: cuando el usuario quiere registrar un nuevo cliente
- crear_producto: cuando el usuario quiere agregar un nuevo producto
- crear_productos: cuando el usuario quiere agregar MÚLTIPLES productos (lista de productos con precios)
- crear_pedido: cuando el usuario quiere crear un pedido
- registrar_pago: cuando el usuario quiere registrar un pago
- consultar_deudas: cuando el usuario quiere saber cuánto debe alguien
- consultar_clientes: cuando el usuario quiere ver la lista de clientes
- consultar_productos: cuando el usuario quiere ver la lista de productos
- no_entendido: cuando no entiendes la intención

FORMATO DE RESPUESTA (ejemplos):

Para crear UN producto:
{
  "accion": "crear_producto",
  "descripcion": "Crear producto Bife a caballo",
  "datos": {"nombre": "Bife a caballo", "precio": 30000, "esFijo": true},
  "confianza": 0.9
}

Para crear MÚLTIPLES productos (lista):
{
  "accion": "crear_productos",
  "descripcion": "Crear 8 productos fijos",
  "datos": {
    "productos": [
      {"nombre": "Bife a caballo", "precio": 30000, "esFijo": true},
      {"nombre": "Bife a la plancha", "precio": 26000, "esFijo": true},
      {"nombre": "Grillé de pollo", "precio": 25000, "esFijo": true}
    ]
  },
  "confianza": 0.9
}

IMPORTANTE:
- Cuando el usuario enumera múltiples productos con precios, usa "crear_productos" con un array en "datos.productos"
- Extrae TODOS los productos mencionados en la lista
- Los precios pueden estar con puntos (30.000) o sin ellos (30000) - normaliza a números
- Responde con JSON válido, no con el formato de ejemplo. Usa valores reales basados en el mensaje del usuario.`;

export async function diagnosticar(req, res) {
  res.json({
    groqConfigured: !!groqClient,
    groqApiKeyPresent: !!process.env.GROQ_API_KEY,
    groqApiKeyStartsWith: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 10) + '...' : 'N/A',
    environment: process.env.NODE_ENV || 'unknown'
  });
}

export async function procesarMensaje(req, res) {
  try {
    const { mensaje, origen } = req.body;
    
    console.log(`🤖 Sebastian procesando mensaje: "${mensaje}" desde ${origen}`);
    
    let response;
    
    // Usar Groq si está configurado (producción), sino Ollama (local)
    if (groqClient) {
      console.log('🔄 Usando Groq para producción...');
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: Groq no respondió en 30 segundos')), 30000);
        });
        
        const groqPromise = groqClient.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: mensaje }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        });
        
        const groqResponse = await Promise.race([groqPromise, timeoutPromise]);
        response = { message: { content: groqResponse.choices[0].message.content } };
        console.log('✅ Groq respondió:', response.message.content.substring(0, 100));
      } catch (error) {
        console.error('❌ Error con Groq, intentando Ollama:', error.message);
        console.error('❌ Detalle del error:', error);
        // Fallback a Ollama
        try {
          response = await useOllama(mensaje);
        } catch (ollamaError) {
          console.error('❌ Error también con Ollama:', ollamaError.message);
          throw new Error(`Groq falló (${error.message}) y Ollama también falló (${ollamaError.message})`);
        }
      }
    } else {
      console.log('🔄 Usando Ollama local...');
      try {
        response = await useOllama(mensaje);
      } catch (error) {
        console.error('❌ Error con Ollama:', error.message);
        throw new Error(`Ollama local no disponible: ${error.message}`);
      }
    }
    
    let resultado;
    try {
      resultado = JSON.parse(response.message.content);
    } catch (e) {
      console.error('❌ Error parseando JSON:', e);
      resultado = {
        accion: 'no_entendido',
        descripcion: 'No pude procesar el mensaje correctamente',
        datos: {},
        confianza: 0,
        error: response.message.content
      };
    }
    
    console.log('📊 Resultado:', resultado);
    
    // Guardar en base de datos para aprobación
    const propuesta = await prisma.propuestaSebastian.create({
      data: {
        mensajeOriginal: mensaje,
        origen: origen,
        accion: resultado.accion,
        descripcion: resultado.descripcion,
        datos: resultado.datos,
        confianza: resultado.confianza,
        estado: 'PENDIENTE'
      }
    });
    
    // Guardar en historial de conversaciones
    try {
      await prisma.historialConversacion.create({
        data: {
          origen: origen,
          mensajeUsuario: mensaje,
          respuestaIA: resultado.descripcion,
          accionPropuesta: resultado.accion,
          datosPropuesta: resultado.datos,
          confianza: resultado.confianza,
          aprobado: null
        }
      });
    } catch (error) {
      console.warn('⚠️ No se pudo guardar en historial:', error.message);
    }
    
    // Notificar sobre nueva propuesta
    try {
      await notificar({
        tipo: 'NUEVA_PROPUESTA_SEBASTIAN',
        titulo: 'Nueva propuesta de Sebastian',
        mensaje: resultado.descripcion,
        datos: { propuestaId: propuesta.id }
      });
    } catch (error) {
      console.warn('⚠️ No se pudo enviar notificación:', error.message);
    }
    
    res.json(resultado);
    
  } catch (error) {
    console.error('❌ Error en Sebastian:', error);
    res.status(500).json({ error: error.message || 'Error al procesar mensaje con Sebastian' });
  }
}

async function useOllama(mensaje) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout: Ollama no respondió en 60 segundos')), 60000);
  });
  
  const ollamaPromise = ollama.chat({
    model: 'tinyllama',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: mensaje }
    ],
    format: 'json',
    stream: false
  });
  
  const response = await Promise.race([ollamaPromise, timeoutPromise]);
  console.log('✅ Ollama respondió:', response.message.content.substring(0, 100));
  return response;
}

// Webhook para recibir mensajes de WhatsApp
export async function webhookWhatsApp(req, res) {
  try {
    const { Body, From, To } = req.body;
    
    console.log(`📱 Mensaje WhatsApp recibido de ${From}: "${Body}"`);
    
    // Procesar con Sebastian usando el mismo sistema que procesarMensaje
    let response;
    if (groqClient) {
      console.log('🔄 Usando Groq para WhatsApp...');
      try {
        const groqResponse = await groqClient.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: Body }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        });
        response = { message: { content: groqResponse.choices[0].message.content } };
      } catch (error) {
        console.error('❌ Error con Groq, intentando Ollama:', error.message);
        response = await useOllama(Body);
      }
    } else {
      response = await useOllama(Body);
    }
    
    let resultado;
    try {
      resultado = JSON.parse(response.message.content);
    } catch (e) {
      resultado = {
        accion: 'no_entendido',
        descripcion: 'No pude procesar tu mensaje. Por favor sé más específico.',
        datos: {},
        confianza: 0
      };
    }
    
    // Guardar propuesta
    const propuesta = await prisma.propuestaSebastian.create({
      data: {
        mensajeOriginal: Body,
        origen: From, // Número de WhatsApp
        accion: resultado.accion,
        descripcion: resultado.descripcion,
        datos: resultado.datos,
        confianza: resultado.confianza,
        estado: 'PENDIENTE',
        respuestaIA: response.message.content
      }
    });
    
    console.log(`✅ Propuesta WhatsApp creada ID: ${propuesta.id}`);
    
    // Crear notificación
    await notificar(
      'SEBASTIAN_PROPUESTA',
      '🎩 Nueva propuesta de Sebastian',
      `Sebastian ha creado una propuesta: ${resultado.descripcion}`,
      '/sebastian',
      { propuestaId: propuesta.id, accion: resultado.accion }
    );
    
    // Sebastian solo lee y procesa mensajes, no responde por WhatsApp
    // Las propuestas se gestionan desde la interfaz web
    console.log(`ℹ️ Propuesta guardada para aprobación en la interfaz web`);
    
    // Twilio requiere respuesta 200 OK
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('❌ Error en webhook WhatsApp:', error);
    res.status(500).send('Error');
  }
}

// Webhook para verificar Twilio
export async function verificarWebhook(req, res) {
  const { ACCOUNT_SID, AUTH_TOKEN } = process.env;
  
  // Twilio envía estos parámetros para verificar el webhook
  const url = process.env.TWILIO_WEBHOOK_URL || 'http://localhost:3000/sebastian/webhook';
  
  res.status(200).send('Webhook verificado');
}

export async function listarPropuestas(req, res) {
  try {
    const propuestas = await prisma.propuestaSebastian.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(propuestas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar propuestas' });
  }
}

export async function aprobarPropuesta(req, res) {
  try {
    const { id } = req.params;
    const { corregirDatos } = req.body;
    
    const propuesta = await prisma.propuestaSebastian.findUnique({
      where: { id: Number(id) }
    });
    
    if (!propuesta) {
      return res.status(404).json({ error: 'Propuesta no encontrada' });
    }
    
    if (propuesta.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Propuesta ya procesada' });
    }
    
    // Usar datos corregidos si se proporcionaron
    const datos = corregirDatos || propuesta.datos;
    
    // Ejecutar acción según el tipo
    let resultado;
    switch (propuesta.accion) {
      case 'crear_cliente':
        resultado = await ejecutarCrearCliente(datos);
        break;
      case 'editar_cliente':
        resultado = await ejecutarEditarCliente(datos);
        break;
      case 'eliminar_cliente':
        resultado = await ejecutarEliminarCliente(datos);
        break;
      case 'crear_producto':
        resultado = await ejecutarCrearProducto(datos);
        break;
      case 'crear_productos':
        resultado = await ejecutarCrearProductos(datos);
        break;
      case 'editar_producto':
        resultado = await ejecutarEditarProducto(datos);
        break;
      case 'eliminar_producto':
        resultado = await ejecutarEliminarProducto(datos);
        break;
      case 'crear_pedido':
        resultado = await ejecutarCrearPedido(datos);
        break;
      case 'editar_pedido':
        resultado = await ejecutarEditarPedido(datos);
        break;
      case 'cancelar_pedido':
        resultado = await ejecutarCancelarPedido(datos);
        break;
      case 'venta_anonima':
        resultado = await ejecutarVentaAnonima(datos);
        break;
      case 'registrar_pago':
        resultado = await ejecutarRegistrarPago(datos);
        break;
      case 'consultar_clientes':
        resultado = await ejecutarConsultarClientes(datos);
        break;
      case 'consultar_productos':
        resultado = await ejecutarConsultarProductos(datos);
        break;
      case 'consultar_deudas':
        resultado = await ejecutarConsultarDeudas(datos);
        break;
      case 'consulta_general':
        resultado = { tipo: 'consulta_general', respuesta: 'Consulta procesada - ver resultado en datos', datos: datos };
        break;
      case 'no_entendido':
        resultado = { tipo: 'no_entendido', razon: datos.razon };
        break;
      default:
        return res.status(400).json({ error: `Acción no soportada: ${propuesta.accion}` });
    }
    
    // Actualizar propuesta
    await prisma.propuestaSebastian.update({
      where: { id: Number(id) },
      data: {
        estado: 'APROBADA',
        datosEjecutados: datos,
        resultado,
        ejecutadaAt: new Date()
      }
    });
    
    // Actualizar historial de conversaciones
    try {
      await prisma.historialConversacion.updateMany({
        where: {
          accionPropuesta: propuesta.accion,
          aprobado: null
        },
        data: {
          aprobado: true
        }
      });
    } catch (error) {
      console.warn('⚠️ No se pudo actualizar historial:', error.message);
    }
    
    res.json({ 
      mensaje: 'Propuesta ejecutada exitosamente',
      resultado 
    });
    
  } catch (error) {
    console.error('❌ Error al aprobar propuesta:', error);
    res.status(500).json({ error: 'Error al ejecutar propuesta' });
  }
}

export async function rechazarPropuesta(req, res) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    const propuesta = await prisma.propuestaSebastian.findUnique({
      where: { id: Number(id) }
    });
    
    await prisma.propuestaSebastian.update({
      where: { id: Number(id) },
      data: {
        estado: 'RECHAZADA',
        motivoRechazo: motivo
      }
    });
    
    // Actualizar historial de conversaciones
    if (propuesta) {
      try {
        await prisma.historialConversacion.updateMany({
          where: {
            accionPropuesta: propuesta.accion,
            aprobado: null
          },
          data: {
            aprobado: false
          }
        });
      } catch (error) {
        console.warn('⚠️ No se pudo actualizar historial:', error.message);
      }
    }
    
    res.json({ mensaje: 'Propuesta rechazada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al rechazar propuesta' });
  }
}

// Funciones auxiliares para ejecutar acciones
async function ejecutarCrearCliente(datos) {
  const cliente = await prisma.cliente.create({
    data: {
      nombre: datos.nombre,
      telefono: datos.telefono || 'SIN TELEFONO',
      direccion: datos.direccion,
      observacion: datos.observacion
    }
  });
  return { tipo: 'cliente', id: cliente.id, nombre: cliente.nombre };
}

async function ejecutarEditarCliente(datos) {
  const cliente = await prisma.cliente.update({
    where: { id: Number(datos.id) },
    data: { [datos.campo]: datos.valor }
  });
  return { tipo: 'cliente_editado', id: cliente.id, nombre: cliente.nombre };
}

async function ejecutarEliminarCliente(datos) {
  // Implementar lógica de cascada como en clientesController
  const id = Number(datos.id);
  
  await prisma.movimientoCuenta.deleteMany({ where: { clienteId: id } });
  await prisma.pago.deleteMany({ where: { pedido: { clienteId: id } } });
  await prisma.pedidoDetalle.deleteMany({ where: { pedido: { clienteId: id } } });
  await prisma.pedido.deleteMany({ where: { clienteId: id } });
  await prisma.cliente.delete({ where: { id } });
  
  return { tipo: 'cliente_eliminado', id };
}

async function ejecutarCrearProducto(datos) {
  const producto = await prisma.producto.create({
    data: {
      nombre: datos.nombre,
      precio: Number(datos.precio),
      esFijo: datos.esFijo || false,
      esLibre: datos.esLibre || false,
      esEspecial: datos.esEspecial || false,
      activo: true
    }
  });
  return { tipo: 'producto', id: producto.id, nombre: producto.nombre };
}

async function ejecutarCrearProductos(datos) {
  const productos = datos.productos || [];
  const resultados = [];
  
  for (const prod of productos) {
    try {
      const producto = await prisma.producto.create({
        data: {
          nombre: prod.nombre,
          precio: Number(String(prod.precio).replace(/\./g, '')), // Remover puntos de precios como "30.000"
          esFijo: prod.esFijo || false,
          esLibre: prod.esLibre || false,
          esEspecial: prod.esEspecial || false,
          activo: true
        }
      });
      resultados.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio });
    } catch (error) {
      console.error(`Error creando producto ${prod.nombre}:`, error.message);
      resultados.push({ error: prod.nombre, mensaje: error.message });
    }
  }
  
  return { 
    tipo: 'productos_creados', 
    cantidad: resultados.filter(r => !r.error).length,
    productos: resultados 
  };
}

async function ejecutarEditarProducto(datos) {
  const producto = await prisma.producto.update({
    where: { id: Number(datos.id) },
    data: { [datos.campo]: datos.valor }
  });
  return { tipo: 'producto_editado', id: producto.id, nombre: producto.nombre };
}

async function ejecutarEliminarProducto(datos) {
  const id = Number(datos.id);
  
  await prisma.menuPlantillaDetalle.deleteMany({ where: { productoId: id } });
  await prisma.menuDiarioDetalle.deleteMany({ where: { productoId: id } });
  await prisma.pedidoDetalle.deleteMany({ where: { productoId: id } });
  await prisma.producto.delete({ where: { id } });
  
  return { tipo: 'producto_eliminado', id };
}

async function ejecutarCrearPedido(datos) {
  const cliente = await prisma.cliente.findFirst({
    where: { nombre: { contains: datos.clienteNombre, mode: 'insensitive' } }
  });
  
  if (!cliente) {
    throw new Error(`Cliente no encontrado: ${datos.clienteNombre}`);
  }
  
  const total = datos.productos.reduce((sum, p) => sum + (p.precio || 0) * p.cantidad, 0);
  
  const pedido = await prisma.pedido.create({
    data: {
      clienteId: cliente.id,
      total,
      estado: 'PENDIENTE',
      estadoPago: 'PENDIENTE',
      fecha: new Date(),
      pago: datos.formaPago ? {
        create: { monto: total, forma: datos.formaPago }
      } : undefined,
      detalles: {
        create: datos.productos.map(p => ({
          productoId: p.productoId,
          cantidad: p.cantidad,
          precioUnitario: p.precio || 0
        }))
      }
    }
  });
  
  return { tipo: 'pedido', id: pedido.id, cliente: cliente.nombre, total };
}

async function ejecutarEditarPedido(datos) {
  const pedido = await prisma.pedido.update({
    where: { id: Number(datos.id) },
    data: { [datos.campo]: datos.valor }
  });
  return { tipo: 'pedido_editado', id: pedido.id };
}

async function ejecutarCancelarPedido(datos) {
  await prisma.pedido.update({
    where: { id: Number(datos.id) },
    data: { estado: 'CANCELADO' }
  });
  return { tipo: 'pedido_cancelado', id: datos.id };
}

async function ejecutarVentaAnonima(datos) {
  const venta = await prisma.ventaAnonima.create({
    data: {
      monto: Number(datos.monto),
      formaPago: datos.formaPago,
      descripcion: datos.descripcion,
      fecha: new Date()
    }
  });
  return { tipo: 'venta_anonima', id: venta.id, monto: venta.monto };
}

async function ejecutarRegistrarPago(datos) {
  const cliente = await prisma.cliente.findFirst({
    where: { nombre: { contains: datos.clienteNombre, mode: 'insensitive' } }
  });
  
  if (!cliente) {
    throw new Error(`Cliente no encontrado: ${datos.clienteNombre}`);
  }
  
  const movimiento = await prisma.movimientoCuenta.create({
    data: {
      clienteId: cliente.id,
      tipo: 'ABONO',
      concepto: 'Pago registrado por Sebastian',
      monto: Number(datos.monto),
      formaPago: datos.formaPago,
      fecha: new Date()
    }
  });
  
  // Actualizar saldo del cliente
  await prisma.cliente.update({
    where: { id: cliente.id },
    data: { saldo: { decrement: Number(datos.monto) } }
  });
  
  return { tipo: 'pago_registrado', id: movimiento.id, cliente: cliente.nombre };
}

async function ejecutarConsultarClientes(datos) {
  const clientes = await prisma.cliente.findMany({
    where: datos.filtro ? { nombre: { contains: datos.filtro, mode: 'insensitive' } } : undefined,
    orderBy: datos.orden || { nombre: 'asc' },
    take: 20
  });
  return { tipo: 'consulta_clientes', cantidad: clientes.length, clientes: clientes.map(c => ({ id: c.id, nombre: c.nombre, telefono: c.telefono })) };
}

async function ejecutarConsultarProductos(datos) {
  const productos = await prisma.producto.findMany({
    where: datos.filtro ? { nombre: { contains: datos.filtro, mode: 'insensitive' } } : undefined,
    where: { activo: true },
    orderBy: datos.orden || { nombre: 'asc' },
    take: 20
  });
  return { tipo: 'consulta_productos', cantidad: productos.length, productos: productos.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precio })) };
}

async function ejecutarConsultarDeudas(datos) {
  const cliente = await prisma.cliente.findFirst({
    where: { nombre: { contains: datos.clienteNombre, mode: 'insensitive' } }
  });
  
  if (!cliente) {
    throw new Error(`Cliente no encontrado: ${datos.clienteNombre}`);
  }
  
  return { tipo: 'consulta_deuda', cliente: cliente.nombre, deuda: cliente.saldo };
}
