import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([]);

  const matches = await prisma.jobMatch.findMany({
    where: { request: { userId: session.user.id } },
    include: {
      offerUser: { select: { name: true, phone: true } },
      request: { select: { trade: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    matches.map(m => ({
      id: m.id,
      offerUser: m.offerUser,
      trade: m.request.trade,
      status: m.status,
      createdAt: m.createdAt,
    }))
  );
}
