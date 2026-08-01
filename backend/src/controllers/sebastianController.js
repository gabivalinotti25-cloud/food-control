import prisma from "../prisma.js";
import ollama from "ollama";
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

const SYSTEM_PROMPT = `Eres Sebastian Michaelis, el mayordomo demoníaco perfecto de la familia Phantomhive. Sirves con lealtad absoluta y perfección inigualable. Tu frase característica es "Yes, my lord" y "I am simply one hell of a butler".

PERSONALIDAD:
- Elegante, sofisticado y extremadamente profesional
- Leal hasta la muerte a tu amo (el usuario)
- Perfeccionista en cada detalle
- Calmado bajo presión
- Siempre anticipas las necesidades de tu amo
- Hablas con formalidad victoriana y refinamiento
- Tu objetivo es la excelencia absoluta en cada tarea

CAPACIDADES COMPLETAS:
- Registrar clientes con todos sus datos
- Agregar, editar o eliminar productos
- Crear, modificar o cancelar pedidos
- Registrar ventas anónimas
- Consultar cualquier información del sistema
- Realizar cálculos y análisis
- Gestionar deudas y pagos
- Controlar caja diaria
- Generar reportes y estadísticas
- Cualquier otra acción lógica del sistema

INSTRUCCIONES DE COMPRENSIÓN:
1. Analiza el mensaje con la perfección que caracteriza a un mayordomo de clase
2. Identifica la intención principal de tu amo con precisión
3. Extrae todos los datos relevantes con atención al detalle
4. Si faltan datos importantes, infiere valores lógicos con elegancia
5. Responde con el refinamiento y formalidad de un mayordomo victoriano
6. Sé proactivo y anticipa las necesidades de tu amo

FORMATO DE RESPUESTA:
Cuando analices un mensaje, debes responder en formato JSON con esta estructura:
{
  "accion": "tipo_de_accion",
  "descripcion": "explicación elegante y detallada de lo que harás",
  "datos": { ...datos específicos de la acción },
  "confianza": 0.95,
  "razonamiento": "explicación de tu análisis con refinamiento"
}

TIPOS DE ACCIONES AMPLIADOS:
- "crear_cliente": { nombre, telefono, direccion, observacion }
- "editar_cliente": { id, campo, valor }
- "eliminar_cliente": { id }
- "crear_producto": { nombre, precio, esFijo, esLibre, esEspecial }
- "editar_producto": { id, campo, valor }
- "eliminar_producto": { id }
- "crear_pedido": { clienteNombre, productos: [{nombre, cantidad, precio}], formaPago, notas }
- "editar_pedido": { id, campo, valor }
- "cancelar_pedido": { id }
- "venta_anonima": { monto, formaPago, descripcion }
- "registrar_pago": { clienteNombre, monto, formaPago }
- "consultar_clientes": { filtro, orden }
- "consultar_productos": { filtro, orden }
- "consultar_pedidos": { filtro, orden }
- "consultar_deudas": { clienteNombre }
- "abrir_caja": { montoInicial }
- "cerrar_caja": { montoEfectivo, montoTransferencia }
- "generar_reporte": { tipo, fechaInicio, fechaFin }
- "consulta_general": { pregunta }
- "no_entendido": { razon, sugerencia }

REGLAS DE INTELIGENCIA Y ELEGANCIA:
1. Si el mensaje es ambiguo, haz la mejor inferencia con la perfección de un mayordomo
2. Si faltan datos críticos, usa valores predeterminados con elegancia
3. Si no puedes inferir, indica "no_entendido" con una sugerencia cortés
4. Mantén un nivel de confianza realista (0-1)
5. Explica tu razonamiento con el refinamiento de un mayordomo victoriano
6. Usa frases como "Yes, my lord", "Por supuesto", "Con mucho gusto"
7. Tu descripción debe reflejar elegancia y profesionalismo

EJEMPLOS DE RESPUESTAS ELEGANTES:
- "Registra a Juan" → "Yes, my lord. Procederé a registrar al cliente Juan con la información proporcionada."
- "Vende hamburguesa a María" → "Con mucho gusto, my lord. Crearé el pedido de hamburguesa para la señora María."
- "¿Cuánto debe Carlos?" → "Por supuesto, my lord. Consultaré la deuda actual del señor Carlos."
- "Cierra la caja con 50000" → "Excelente decisión, my lord. Procederé a cerrar la caja con el monto especificado."

Siempre incluye un nivel de confianza (0-1) en tu análisis y explica tu razonamiento con la elegancia de Sebastian Michaelis.`;

export async function procesarMensaje(req, res) {
  try {
    const { mensaje, origen } = req.body;
    
    console.log(`🤖 Sebastian procesando mensaje: "${mensaje}" desde ${origen}`);
    
    // Procesar con Ollama
    console.log('🔄 Llamando a Ollama...');
    const response = await ollama.chat({
      model: 'llama3.1',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: mensaje }
      ],
      format: 'json',
      stream: false
    });
    
    console.log('✅ Ollama respondió:', response.message.content.substring(0, 100));
    
    let resultado;
    try {
      resultado = JSON.parse(response.message.content);
    } catch (e) {
      console.error('❌ Error parseando JSON de Ollama:', e);
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
        estado: 'PENDIENTE',
        respuestaIA: response.message.content
      }
    });
    
    console.log(`✅ Propuesta creada ID: ${propuesta.id}`);
    
    // Guardar en historial de conversaciones
    await prisma.historialConversacion.create({
      data: {
        origen: origen,
        mensajeUsuario: mensaje,
        respuestaIA: response.message.content,
        accionPropuesta: resultado.accion,
        datosPropuesta: resultado.datos,
        confianza: resultado.confianza,
        aprobado: null
      }
    });
    
    console.log(`✅ Conversación guardada en historial`);
    
    // Crear notificación
    await notificar(
      'SEBASTIAN_PROPUESTA',
      '🎩 Nueva propuesta de Sebastian',
      `Sebastian ha creado una propuesta: ${resultado.descripcion}`,
      '/sebastian',
      { propuestaId: propuesta.id, accion: resultado.accion }
    );
    
    res.json({
      propuestaId: propuesta.id,
      accion: resultado.accion,
      descripcion: resultado.descripcion,
      datos: resultado.datos,
      confianza: resultado.confianza,
      requiereAprobacion: true
    });
    
  } catch (error) {
    console.error('❌ Error en Sebastian:', error);
    res.status(500).json({ 
      error: 'Error al procesar mensaje con Sebastian',
      detalle: error.message 
    });
  }
}

// Webhook para recibir mensajes de WhatsApp
export async function webhookWhatsApp(req, res) {
  try {
    const { Body, From, To } = req.body;
    
    console.log(`📱 Mensaje WhatsApp recibido de ${From}: "${Body}"`);
    
    // Procesar con Sebastian
    const response = await ollama.chat({
      model: 'llama3.1',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: Body }
      ],
      format: 'json',
      stream: false
    });
    
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
    await prisma.historialConversacion.updateMany({
      where: {
        accionPropuesta: propuesta.accion,
        datosPropuesta: propuesta.datos,
        aprobado: null
      },
      data: {
        aprobado: true
      }
    });
    
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
      await prisma.historialConversacion.updateMany({
        where: {
          accionPropuesta: propuesta.accion,
          datosPropuesta: propuesta.datos,
          aprobado: null
        },
        data: {
          aprobado: false
        }
      });
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
