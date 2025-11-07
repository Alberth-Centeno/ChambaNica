import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });

  const ratings = await prisma.rating.findMany({
    where: { givenById: userId },
    include: {
      receivedBy: { select: { name: true } },
      jobPosting: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(ratings);
}