import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) return NextResponse.json([]);

  const results = await prisma.$queryRaw<{ id: string; name: string; city: string; worshipType: string }[]>`
    SELECT id, name, city, "worshipType"
    FROM synagogues
    WHERE name ILIKE ${"%" + q + "%"}
    ORDER BY name ASC
    LIMIT 8
  `;

  return NextResponse.json(results);
}
