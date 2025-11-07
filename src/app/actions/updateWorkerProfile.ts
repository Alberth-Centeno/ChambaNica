"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "../lib/prisma";
import { $Enums } from "@prisma/client";

export async function updateWorkerProfile(formData: FormData) {

  const session = await getServerSession(authOptions);
  
  // CORRECTO: Usa el tipo de sesión extendido
 // if (!session?.user?.id || session.user.role !== "TRABAJADOR") {
   // throw new Error("No autorizado");
  //}

  const userId = session.user.id;
  const specialties = JSON.parse(formData.get("specialties") as string) as string[];

  // Validar que sean oficios válidos
  const validTrades = Object.values($Enums.Trade); // Usa el enum real
  const invalid = specialties.filter(s => !validTrades.includes(s));
  if (invalid.length > 0) {
    throw new Error(`Oficios inválidos: ${invalid.join(", ")}`);
  }

  const specialtiesEnum = specialties.map(s => s as $Enums.Trade);

  await prisma.workerProfile.upsert({
    where: { userId },
    update: { specialties: specialtiesEnum },
    create: { userId, specialties: specialtiesEnum },
  });

  return { success: true };
}