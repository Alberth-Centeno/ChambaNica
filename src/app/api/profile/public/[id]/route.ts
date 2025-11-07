// src/app/api/profile/public/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      zone: true,
      profilePhotoUrl: true,
      bio: true,
      verified: true,
      serviceOffers: {
        select: {
          trade: true,
          yearsExperience: true,
          workPhotoUrl: true,
        },
      },
      jobRequests: {
        where: { isActive: true },
        select: { photoUrl: true },
        take: 1,
      },
    },
  });

  if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // === NUEVO: TRABAJOS COMPLETADOS ===
  const completedMatches = await prisma.jobMatch.findMany({
    where: {
      OR: [
        { request: { userId: id } },
        { offerUserId: id }
      ],
      status: "COMPLETED"
    },
    include: {
      request: { select: { trade: true, user: { select: { name: true } } } },
      ratings: {
        where: { ratedId: id },
        select: { score: true, comment: true, createdAt: true, rater: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const totalCompleted = completedMatches.length;
  const averageRating = completedMatches.reduce((acc, m) => acc + (m.ratings[0]?.score || 0), 0) / totalCompleted || 0;

  const recentReviews = completedMatches
    .filter(m => m.ratings.length > 0)
    .slice(0, 3)
    .map(m => ({
      trade: m.request.trade,
      clientName: m.request.user.name,
      rating: m.ratings[0].score,
      comment: m.ratings[0].comment || "",
      date: m.ratings[0].createdAt.toISOString(),
      raterName: m.ratings[0].rater.name
    }));

  return NextResponse.json({
    ...user,
    offers: user.serviceOffers,
    jobPhotoUrl: user.jobRequests?.[0]?.photoUrl || null,
    stats: {
      totalCompleted,
      averageRating: Number(averageRating.toFixed(1)),
      recentReviews
    }
  });
}