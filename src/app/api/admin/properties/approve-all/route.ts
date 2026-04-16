import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const result = await prisma.property.updateMany({
    where: { isApproved: false },
    data: { isApproved: true },
  });

  return NextResponse.json({ approved: result.count });
}
