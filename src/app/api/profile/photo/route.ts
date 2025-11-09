import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { uploadFile } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await req.formData();
  const photo = formData.get("photo") as File | null;
  if (!photo) return NextResponse.json({ error: "Falta foto" }, { status: 400 });

  const url = await uploadFile(photo);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profilePhotoUrl: url },
  });

  return NextResponse.json({ url });
}