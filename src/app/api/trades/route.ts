import { NextResponse } from "next/server";
import { Trade } from "@prisma/client";

export async function GET() {
  // Devuelve los valores válidos del enum Trade
  return NextResponse.json({ trades: Object.values(Trade) });
}
