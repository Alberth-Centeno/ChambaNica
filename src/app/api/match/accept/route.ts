// src/app/api/match/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { matchId, action } = await req.json(); // action: "ACCEPT" | "REJECT"
  if (!matchId || !["ACCEPT", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const match = await prisma.jobMatch.findUnique({
    where: { id: matchId },
    include: { request: true },
  });

  if (!match || match.request.userId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.jobMatch.update({
    where: { id: matchId },
    data: { status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" },
  });

  if (action === "REJECT") {
    await prisma.jobRequest.update({
      where: { id: match.requestId },
      data: { isActive: false },
    });
  }

  return NextResponse.json({ success: true });
}