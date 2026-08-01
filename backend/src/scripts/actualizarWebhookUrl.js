import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

// Leer el archivo .env actual
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}

// URL del webhook de localtunnel
const webhookUrl = 'https://huge-cows-tell.loca.lt/sebastian/webhook';

// Actualizar TWILIO_WEBHOOK_URL
const lines = envContent.split('\n');
const updatedLines = lines.map(line => {
  if (line.startsWith('TWILIO_WEBHOOK_URL=')) {
    return `TWILIO_WEBHOOK_URL=${webhookUrl}`;
  }
  return line;
});

const newEnvContent = updatedLines.join('\n');

try {
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ TWILIO_WEBHOOK_URL actualizado en .env');
  console.log('📁 Ruta:', envPath);
  console.log('🔗 URL del webhook:', webhookUrl);
} catch (error) {
  console.error('❌ Error al actualizar .env:', error);
}
