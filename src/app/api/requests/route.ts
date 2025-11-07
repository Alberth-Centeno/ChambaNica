// src/app/api/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trade = searchParams.get("trade");
    const zone = searchParams.get("zone");

    console.log("GET /api/requests → Filtros:", { trade, zone });

    const where: any = {
      isActive: true,
    };

    if (trade) where.trade = trade;
    if (zone) where.zone = zone;

    const requests = await prisma.jobRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Solicitudes encontradas:", requests.length);

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Error en GET /api/requests:", error);
    return NextResponse.json(
      { error: "Error del servidor", details: error.message },
      { status: 500 }
    );
  }
}