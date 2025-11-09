import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([]);

  const jobs = await prisma.jobMatch.findMany({
    where: { 
      OR: [
        { request: { userId: session.user.id } },
        { offerUserId: session.user.id }
      ],
      status: "COMPLETED" 
    },
    include: {
      request: { select: { trade: true, user: { select: { name: true } } } },
      ratings: {
        where: { ratedId: session.user.id },
        select: { score: true, comment: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    jobs.map(j => ({
      id: j.id,
      clientName: j.request.user.name,
      trade: j.request.trade,
      rating: j.ratings[0]?.score || 0,
      comment: j.ratings[0]?.comment || "",
      createdAt: j.createdAt,
    }))
  );
}