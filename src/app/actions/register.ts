'use server';
import { prisma } from '../lib/prisma'; 
import bcrypt from 'bcryptjs';
import { uploadFile } from '../lib/cloudinary';
import { Role, Zone } from '@prisma/client';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().min(1),
  role: z.nativeEnum(Role),
  zone: z.nativeEnum(Zone),
  idPhoto: z.instanceof(File),
});

export async function registerUser(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    role: formData.get('role') as Role,
    zone: formData.get('zone') as Zone,
    idPhoto: formData.get('idPhoto') as File,
  };

  const validated = registerSchema.parse(data);

  const hashedPassword = await bcrypt.hash(validated.password, 10);
  const idPhotoUrl = await uploadFile(validated.idPhoto);

  const user = await prisma.user.create({
    data: {
      email: validated.email,
      password: hashedPassword,
      name: validated.name,
      phone: validated.phone,
      role: validated.role,
      zone: validated.zone,
      idPhotoUrl,
    },
  });

  if (validated.role === 'TRABAJADOR') {
    await prisma.workerProfile.create({ data: { userId: user.id } });
  } else {
    await prisma.clientProfile.create({ data: { userId: user.id } });
  }

  return { success: true, userId: user.id };
}