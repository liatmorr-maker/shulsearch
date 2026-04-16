import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { isApproved, isFeatured, status } = body;

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: {
      ...(isApproved !== undefined && { isApproved }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(status !== undefined && { status }),
    },
  });

  return NextResponse.json(updated);
}
