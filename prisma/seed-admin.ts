import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@chambanica.com';
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password,
      verified: true,
    },
    create: {
      email,
      password,
      name: 'Administrador',
      phone: '88888888',
      zone: 'ZONA1',
      idPhotoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', // opcional
      verified: true,
    },
  });

  console.log('Admin creado: admin@chambanica.com / admin123');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());