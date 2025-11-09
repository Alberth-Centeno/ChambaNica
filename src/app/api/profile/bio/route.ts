// src/app/api/profile/bio/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ bio: "" });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { bio: true },
  });

  return NextResponse.json({ bio: user?.bio || "" });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { bio } = await req.json();
  if (typeof bio !== "string" || bio.length > 300) {
    return NextResponse.json({ error: "Bio inválida" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bio },
  });

  return NextResponse.json({ success: true });
}