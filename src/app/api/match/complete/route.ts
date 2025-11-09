// src/app/api/match/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { matchId } = await req.json();
  if (!matchId) return NextResponse.json({ error: "Falta ID" }, { status: 400 });

  const match = await prisma.jobMatch.findUnique({
    where: { id: matchId },
    include: { request: true },
  });

  if (!match) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const isRequester = match.request.userId === session.user.id;
  const isOfferer = match.offerUserId === session.user.id;

  if (!isRequester && !isOfferer) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (match.status !== "ACCEPTED") {
    return NextResponse.json({ error: "Solo servicios aceptados" }, { status: 400 });
  }

  const data: any = {};
  if (isRequester) data.completedByRequester = true;
  if (isOfferer) data.completedByOfferer = true;

  const updated = await prisma.jobMatch.update({
    where: { id: matchId },
    data,
  });

  // Si ambos marcaron → COMPLETADO
  if (updated.completedByRequester && updated.completedByOfferer) {
    await prisma.jobMatch.update({
      where: { id: matchId },
      data: { status: "COMPLETED" },
    });
  }

  return NextResponse.json({ success: true });
}