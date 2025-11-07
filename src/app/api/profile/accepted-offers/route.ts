// src/app/api/profile/accepted-offers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([]);

  // Busca JobMatch donde el usuario es el que solicita (cliente)
  const matches = await prisma.jobMatch.findMany({
    where: {
      request: { userId: session.user.id },
      status: "ACCEPTED", // ← Solo servicios aceptados
    },
    include: {
      offerUser: {
        select: { id: true, name: true, phone: true },
      },
      request: {
        select: { trade: true, description: true, zone: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    matches.map(m => ({
      id: m.id,
      offerUserId: m.offerUser.id,
      clientName: m.offerUser.name,
      clientPhone: m.offerUser.phone,
      trade: m.request.trade,
      description: m.request.description,
      zone: m.request.zone,
      status: m.status, // ← IMPORTANTE: incluye el status
      createdAt: m.createdAt.toISOString(),
    }))
  );
}