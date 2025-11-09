import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: Request, { params }: { params: { usersId: string } }) {
  const userId = params.usersId;
  if (!userId) {
    return Response.json({ error: "Falta el parámetro userId" }, { status: 400 });
  }

const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    ratingsReceived: {
      take: 5,
      orderBy: { createdAt: "desc" }
    },
    _count: { select: { ratingsReceived: true } }
  }
});
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  // Promedio rating
  const avgRating = await prisma.rating.aggregate({
    where: { raterId: userId },
    _avg: { score: true },
  });

  return NextResponse.json({
    user: {
      ...user,
      photoUrl: user.profilePhotoUrl || "",
      avgRating: avgRating._avg?.score || 0,
      totalRatings: user._count.ratingsReceived,
    }
  });
}