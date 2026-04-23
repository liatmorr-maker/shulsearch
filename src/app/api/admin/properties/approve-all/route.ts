import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await prisma.property.updateMany({
    where: { isApproved: false },
    data: { isApproved: true },
  });

  return NextResponse.json({ approved: result.count });
}
