import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { matchId, score, comment } = await req.json();

  if (!matchId || !score || score < 1 || score > 5) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const match = await prisma.jobMatch.findUnique({
    where: { id: matchId },
    include: { request: true },
  });

  if (!match || match.status !== "COMPLETED") {
    return NextResponse.json({ error: "Trabajo no completado" }, { status: 400 });
  }

  const isRequester = match.request.userId === session.user.id;
  const isOfferer = match.offerUserId === session.user.id;

  if (!isRequester && !isOfferer) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const ratedId = isRequester ? match.offerUserId : match.request.userId;

  // Crear o actualizar calificación
  const rating = await prisma.rating.upsert({
    where: {
      // Replace 'id' with your actual unique field for the rating, e.g., a composite unique constraint if defined
      matchId_raterId: {
        matchId,
        raterId: session.user.id,
      } as any // Temporary workaround if Prisma schema has a composite unique constraint named 'matchId_raterId'
    },
    update: { score, comment },
    create: {
      matchId,
      raterId: session.user.id,
      ratedId,
      score,
      comment: comment || null,
    },
  });

  return NextResponse.json({ success: true, rating });
}