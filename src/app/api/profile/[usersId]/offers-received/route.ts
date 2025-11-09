import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: { usersId: string } }) {
  const { params } = context;
  const userId = (await params).usersId;
  if (!userId) {
    return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
  }
  // Ofertas recibidas para solicitudes del usuario
  const offers = await prisma.jobMatch.findMany({
    where: {
      request: { userId },
      status: { in: ["PENDING", "ACCEPTED", "REJECTED"] }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      offerUser: { select: { name: true, phone: true } },
      request: true,
    },
  });
  return NextResponse.json({ offers });
}
