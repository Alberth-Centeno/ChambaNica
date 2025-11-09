// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";           // RUTA CORRECTA
import bcrypt from "bcryptjs";
import { uploadFile } from "@/lib/cloudinary";     // RUTA CORRECTA
import { Zone } from "@prisma/client";             // IMPORTANTE

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const zoneString = formData.get("zone") as string;
    const idPhoto = formData.get("idPhoto") as File | null;

    // Validar campos
    if (!email || !password || !name || !phone || !zoneString || !idPhoto) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Validar email y contraseña
    if (!email.includes("@") || password.length < 8) {
      return NextResponse.json({ error: "Email o contraseña inválida" }, { status: 400 });
    }

    // Validar zona (enum)
    if (!Object.values(Zone).includes(zoneString as Zone)) {
      return NextResponse.json({ error: "Zona inválida" }, { status: 400 });
    }
    const zone = zoneString as Zone;

    // Verificar si ya existe
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 });
    }

    // Subir foto de cédula
    let idPhotoUrl: string;
    try {
      idPhotoUrl = await uploadFile(idPhoto);
    } catch (uploadError) {
      console.error("Error Cloudinary:", uploadError);
      return NextResponse.json({ error: "Error al subir la foto de cédula" }, { status: 500 });
    }

    // Crear usuario
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        zone,                    // SIN "as any" → usa el enum correcto
        idPhotoUrl,
        verified: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno. Inténtalo más tarde." },
      { status: 500 }
    );
  }
}
