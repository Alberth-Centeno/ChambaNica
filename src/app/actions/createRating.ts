'use server';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const ratingSchema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
  receivedById: z.string(),
  jobPostingId: z.string().optional(),
});

export async function createRating(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('No autorizado');

  const data = {
    score: parseInt(formData.get('score') as string),
    comment: formData.get('comment') as string,
    receivedById: formData.get('receivedById') as string,
    jobPostingId: formData.get('jobPostingId') as string,
  };

  const validated = ratingSchema.parse(data);

  await prisma.rating.create({
    data: {
      ...validated,
      givenById: session.user.id as string,
    },
  });

  return { success: true };
}