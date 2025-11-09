import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== "admin@chambanica.com") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "Falta el ID del usuario" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al verificar usuario" }, { status: 500 });
  }
}