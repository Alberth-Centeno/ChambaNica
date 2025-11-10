// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { uploadFile } from "@/lib/cloudinary";
import { Zone } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const zoneString = formData.get("zone")?.toString() || "";
    const idPhoto = formData.get("idPhoto");

    // VALIDACIONES
    if (!email || !password || !name || !phone || !zoneString || !idPhoto) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    if (!email.includes("@") || password.length < 8) {
      return NextResponse.json({ error: "Email o contraseña inválida" }, { status: 400 });
    }

    if (!Object.values(Zone).includes(zoneString as Zone)) {
      return NextResponse.json({ error: "Zona inválida" }, { status: 400 });
    }

    // VERIFICAR USUARIO EXISTENTE
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
    }

    // CONVERTIR File A OBJETO COMPATIBLE
    let buffer: Buffer;
    if (idPhoto instanceof File) {
      const arrayBuffer = await idPhoto.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      return NextResponse.json({ error: "Foto inválida" }, { status: 400 });
    }

    // SUBIR A CLOUDINARY
    const idPhotoUrl = await uploadFile(idPhoto as File);

    // CREAR USUARIO
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        zone: zoneString as Zone,
        idPhotoUrl,
        verified: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ERROR REGISTRO:", error);
    return NextResponse.json(
      { error: "Error interno. Intenta de nuevo." },
      { status: 500 }
    );
  }
}