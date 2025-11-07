import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({});

  const [requests, offersReceived, accepted, completed] = await Promise.all([
    prisma.jobRequest.count({ where: { userId: session.user.id } }),
    prisma.jobMatch.count({ where: { request: { userId: session.user.id } } }),
    prisma.jobMatch.count({ where: { request: { userId: session.user.id }, status: "ACCEPTED" } }),
    prisma.jobMatch.count({ where: { OR: [{ offerUserId: session.user.id }, { request: { userId: session.user.id } }], status: "COMPLETED" } }),
  ]);

  return NextResponse.json({ requests, offersReceived, accepted, completed });
}