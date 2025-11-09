// src/app/api/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";


export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.verified) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { requestId } = await req.json();
  if (!requestId) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

  const request = await prisma.jobRequest.findUnique({
    where: { id: requestId, isActive: true },
    include: { user: true },
  });

  if (!request) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }

  // Evitar duplicados
  const existing = await prisma.jobMatch.findFirst({
    where: {
      requestId,
      offerUserId: session.user.id,
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Ya ofreciste tu servicio" }, { status: 400 });
  }

  await prisma.jobMatch.create({
    data: {
      requestId,
      offerUserId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}