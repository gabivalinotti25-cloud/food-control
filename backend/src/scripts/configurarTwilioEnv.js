import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

// Leer el archivo .env actual
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}

// Variables existentes
const existingVars = {
  DATABASE_URL: '',
  JWT_SECRET: '',
  PORT: ''
};

// Parsear variables existentes
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    existingVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Nuevo contenido con variables de Twilio
const newEnvContent = `DATABASE_URL=${existingVars.DATABASE_URL || 'postgresql://postgres:esferewrewrewrwgdth@db.ofpcfnczjttbvaziaqsz.supabase.co:5432/postgres'}
JWT_SECRET=${existingVars.JWT_SECRET || 'supersecretjwtkey'}
PORT=${existingVars.PORT || '3000'}

# Twilio Configuration
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_WEBHOOK_URL=https://tu-dominio.com/sebastian/webhook
`;

try {
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ Archivo .env actualizado con configuración de Twilio');
  console.log('📁 Ruta:', envPath);
  console.log('\n⚠️  Necesitas configurar las siguientes variables de Twilio:');
  console.log('1. TWILIO_ACCOUNT_SID - Tu Account SID de Twilio');
  console.log('2. TWILIO_AUTH_TOKEN - Tu Auth Token de Twilio');
  console.log('3. TWILIO_WHATSAPP_NUMBER - Tu número de WhatsApp de Twilio');
  console.log('4. TWILIO_WEBHOOK_URL - URL pública de tu webhook (para producción)');
} catch (error) {
  console.error('❌ Error al configurar .env:', error);
}
