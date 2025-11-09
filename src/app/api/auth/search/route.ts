import { NextResponse } from 'next/server';
import { Trade, Zone } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trade = searchParams.get('trade') as Trade | null;
  const zone = searchParams.get('zone') as Zone | null;

  const workers = await prisma.workerProfile.findMany({
    where: {
      specialties: trade ? { has: trade } : undefined,
      user: { zone },
    },
    include: {
      user: {
        select: { id: true, name: true, phone: true, zone: true },
      },
    },
  });

  const workersWithRatings = await Promise.all(workers.map(async (worker) => {
    const ratings = await prisma.rating.aggregate({
      where: { receivedById: worker.userId },
      _avg: { score: true },
      _count: { score: true },
    });
    return { ...worker, avgRating: ratings._avg.score || 0, ratingCount: ratings._count.score };
  }));

  return NextResponse.json(workersWithRatings);
}