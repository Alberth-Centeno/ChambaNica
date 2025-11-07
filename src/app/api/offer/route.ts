import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";
import { uploadFile } from "@/app/lib/cloudinary";
import { Trade } from "@prisma/client";
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.verified) {
    return new Response("No autorizado", { status: 401 });
  }

  const formData = await req.formData();
  const trade = formData.get("trade") as string;
  const years = parseInt(formData.get("years") as string);
  const photo = formData.get("photo") as File;

  // Cast trade to Trade type
  const tradeValue = trade as Trade;

  const workPhotoUrl = await uploadFile(photo);

  await prisma.serviceOffer.upsert({
    where: { userId_trade: { userId: session.user.id, trade: tradeValue } },
    update: { yearsExperience: years, workPhotoUrl },
    create: { userId: session.user.id, trade: tradeValue, yearsExperience: years, workPhotoUrl },
  });

  return new Response(JSON.stringify({ success: true }));
}