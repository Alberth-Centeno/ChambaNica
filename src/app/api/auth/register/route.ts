import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; 
import bcrypt from "bcryptjs";
import { uploadFile } from "@/app/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const zone = formData.get("zone") as string;
    const idPhoto = formData.get("idPhoto") as File | null;

    if (!email || !password || !name || !phone || !zone || !idPhoto) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });

    const idPhotoUrl = await uploadFile(idPhoto);
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        zone: zone as any,
        idPhotoUrl,
        verified: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}