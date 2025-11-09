import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Trade, Zone } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tradeParam = searchParams.get('trade');
  const zoneParam = searchParams.get('zone');

  const trade = tradeParam ? (tradeParam as Trade) : undefined;
  const zone = zoneParam ? (zoneParam as Zone) : undefined;

  const postings = await prisma.jobPosting.findMany({
    where: {
      tradeRequired: trade ? { has: trade } : undefined,
      zone,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  return NextResponse.json(postings);
}