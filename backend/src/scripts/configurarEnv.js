import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');

const envContent = `DATABASE_URL=postgresql://postgres:esferewrewrewrwgdth@db.ofpcfnczjttbvaziaqsz.supabase.co:5432/postgres
JWT_SECRET="supersecretjwtkey"
PORT=3000
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env configurado correctamente con Supabase PostgreSQL');
  console.log('📁 Ruta:', envPath);
} catch (error) {
  console.error('❌ Error al configurar .env:', error);
  console.log('💡 Por favor, edita manualmente el archivo backend/.env con:');
  console.log('DATABASE_URL=postgresql://postgres:esferewrewrewrwgdth@db.ofpcfnczjttbvaziaqsz.supabase.co:5432/postgres');
}
