import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { uploadFile } from "@/app/lib/cloudinary";

export async function POST(req: NextRequest, { params }: { params: { usersId: string } }) {
  const { usersId } = await params;
  if (!usersId) return NextResponse.json({ error: "Falta userId" }, { status: 400 });

  const session = await getServerSession(authOptions);
  // Solo permitir que el usuario autenticado actualice su propia foto
  if (!session?.user?.id || session.user.id !== usersId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await req.formData();
  const photo = formData.get("photo") as File | null;
  if (!photo) return NextResponse.json({ error: "Falta foto" }, { status: 400 });

  const url = await uploadFile(photo);

  await prisma.user.update({
    where: { id: usersId },
    data: { profilePhotoUrl: url },
  });

  return NextResponse.json({ photoUrl: url });
}
