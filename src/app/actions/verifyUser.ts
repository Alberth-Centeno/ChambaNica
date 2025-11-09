'use server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const verifySchema = z.object({ userId: z.string() });

export async function verifyUser(formData: FormData) {
  const { userId } = verifySchema.parse({
    userId: formData.get('userId') as string,
  });

  await prisma.user.update({
    where: { id: userId },
    data: { verified: true },
  });

  return { success: true };
}