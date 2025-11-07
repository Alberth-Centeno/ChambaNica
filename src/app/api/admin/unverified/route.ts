import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.email !== "admin@chambanica.com") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { verified: false },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        zone: true,
        idPhotoUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}