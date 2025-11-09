import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([]);

  const offers = await prisma.serviceOffer.findMany({
    where: { userId: session.user.id },
    select: { id: true, trade: true, yearsExperience: true, workPhotoUrl: true },
  });

  return NextResponse.json(offers);
}