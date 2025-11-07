'use server';
import { prisma } from '../lib/prisma';
import { uploadMultipleFiles }from '../lib/cloudinary';
import { Trade, Zone } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';



const postingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().optional(),
  zone: z.nativeEnum(Zone),
  contactPhone: z.string().min(1),
  tradeRequired: z.array(z.nativeEnum(Trade)),
  photos: z.array(z.string().url()).optional(),
});

export async function createJobPosting(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'CLIENTE') throw new Error('No autorizado');

  const files = formData.getAll('photos') as File[];
  const photoUrls = files.length > 0 ? await uploadMultipleFiles(files) : [];

  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: formData.get('price') ? parseFloat(formData.get('price') as string) : undefined,
    zone: formData.get('zone') as Zone,
    contactPhone: formData.get('contactPhone') as string,
    tradeRequired: JSON.parse(formData.get('tradeRequired') as string),
    photos: photoUrls,
  };

  const validated = postingSchema.parse(data);

  const posting = await prisma.jobPosting.create({
    data: {
      ...validated,
      createdById: session.user.id as string,
    },
  });

  return { success: true, postingId: posting.id };
}