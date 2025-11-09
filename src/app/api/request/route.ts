import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma"; 
import { uploadFile } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });
  }

  if (!session.user.verified) {
    return new Response(JSON.stringify({ error: "Perfil no verificado" }), { status: 403 });
  }

  const formData = await req.formData();
  const trade = formData.get("trade") as string;
  const description = formData.get("description") as string;
  const zone = formData.get("zone") as string;
  const photo = formData.get("photo") as File | null;

  if (!trade || !description || !zone) {
    return new Response(JSON.stringify({ error: "Faltan datos" }), { status: 400 });
  }

  let photoUrl: string | null = null;
  if (photo) {
    try {
      photoUrl = await uploadFile(photo);
    } catch (error) {
      return new Response(JSON.stringify({ error: "Error subiendo foto" }), { status: 500 });
    }
  }

  await prisma.jobRequest.create({
    data: {
      userId: session.user.id,
      trade: trade as any,
      description,
      zone: zone as any,
      photoUrl,
    },
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
