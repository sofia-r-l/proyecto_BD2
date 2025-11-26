
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import path from 'path';

// Cargar .env MANUALMENTE desde la raíz del proyecto
config({ path: path.resolve(process.cwd(), '.env') });

console.log('🔧 Checking Prisma client...');
console.log('📊 DATABASE_URL:', process.env.DATABASE_URL);
console.log('📁 Current directory:', process.cwd());

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Testing database connection...');

  try {
    console.log('🔌 Attempting database connection...');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Database connection successful');
    console.log('📊 Result:', result);

  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error('Error message:', error.message);

    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔚 Seed process completed');
  });