import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getPropertyById } from "@/lib/db-helpers";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ results: [] });

  const saved = await prisma.savedProperty.findMany({
    where: { user: { clerkId: userId } },
    orderBy: { createdAt: "desc" },
    select: { propertyId: true },
  });

  const properties = await Promise.all(
    saved.map(({ propertyId }) => getPropertyById(propertyId))
  );

  return NextResponse.json({
    results: properties.filter(Boolean),
  });
}
