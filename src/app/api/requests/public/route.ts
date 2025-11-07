import { Trade, Zone } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { uploadImage } from "@/lib/upload";
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const trade = formData.get("trade") as Trade;
  const description = formData.get("description") as string;
  const zone = formData.get("zone") as Zone;
  const photo = formData.get("photo") as File | null;

  if (!trade || !description || !zone) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  let photoUrl = null;
  if (photo) {
    try {
      photoUrl = await uploadImage(photo, "requests");
    } catch (e) {
      return NextResponse.json({ error: "Error al subir la foto" }, { status: 500 });
    }
  }

  const jobRequest = await prisma.jobRequest.create({
    data: {
      userId: session.user.id,
      trade,
      description,
      zone,
      photoUrl,
    },
  });

  return NextResponse.json({ success: true, id: jobRequest.id });
}
// src/app/api/requests/public/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 
export async function GET() {
  const requests = await prisma.jobRequest.findMany({
    where: {
      // Opcional: solo solicitudes activas
      // status: "OPEN"
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          profilePhotoUrl: true,
          serviceOffers: {
            where: { isActive: true },
            select: {
              id: true,
              trade: true,
              yearsExperience: true,
              workPhotoUrl: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // límite razonable
  });

  return NextResponse.json(
    requests.map(r => ({
      id: r.id,
      trade: r.trade,
      description: r.description,
      zone: r.zone,
      createdAt: r.createdAt.toISOString(),
      photoUrl: r.photoUrl,
      user: {
        id: r.user.id,
        name: r.user.name,
        phone: r.user.phone,
        profilePhotoUrl: r.user.profilePhotoUrl,
      },
    }))
  );
}