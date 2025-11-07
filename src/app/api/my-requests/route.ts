import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([]);

  const requests = await prisma.jobRequest.findMany({
    where: { userId: session.user.id },
    select: { id: true, trade: true, description: true, zone: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
