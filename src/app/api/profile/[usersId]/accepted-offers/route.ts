import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { usersId: string } }
) {
  const userId = params.usersId;

  if (!userId) {
    return NextResponse.json({ error: 'Falta userId' }, { status: 400 });
  }

  try {
    const offers = await prisma.jobMatch.findMany({
      where: {
        offerUserId: userId,
        status: 'ACCEPTED',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        request: true,
        offerUser: { select: { name: true, phone: true } },
      },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Error fetching accepted offers:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}