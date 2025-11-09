import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: { usersId: string } }) {
  const { params } = context;
  const userId = (await params).usersId;
  if (!userId) {
    return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
  }
  const requests = await prisma.jobRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ requests });
}
