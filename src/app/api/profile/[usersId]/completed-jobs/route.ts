import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request, context: { params: { usersId: string } }) {
  const { params } = context;
  const userId = (await params).usersId;
  if (!userId) {
    return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
  }
  const jobs = await prisma.jobMatch.findMany({
    where: {
      offerUserId: userId,
      status: "COMPLETED"
    },
    orderBy: { createdAt: 'desc' },
    include: {
      request: true,
      offerUser: { select: { name: true, phone: true } },
    },
  });
  return NextResponse.json({ jobs });
}
