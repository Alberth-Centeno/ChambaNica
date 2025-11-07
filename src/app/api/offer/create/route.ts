// src/app/api/offer/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { uploadImage } from "@/lib/upload"; // Asegúrate de tener esta función

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await req.formData();
  const requestId = formData.get("requestId") as string;
  const trade = formData.get("trade") as string;
  const yearsExperience = parseInt(formData.get("yearsExperience") as string);
  const workPhoto = formData.get("workPhoto") as File | null;

  if (!requestId || !trade || isNaN(yearsExperience)) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  let workPhotoUrl = null;
  if (workPhoto) {
    workPhotoUrl = await uploadImage(workPhoto, "offers");
  }

  // Crear oferta
  const offer = await prisma.serviceOffer.create({
    data: {
      userId: session.user.id,
      trade: trade as any, // Cast to the correct enum type
      yearsExperience,
      workPhotoUrl: workPhotoUrl ?? "",
    },
  });

  // Crear match
  await prisma.jobMatch.create({
    data: {
      requestId,
      offerUserId: session.user.id,
      serviceOfferId: offer.id, 
      status: "PENDING",
    },
  });

  return NextResponse.json({ success: true });
}