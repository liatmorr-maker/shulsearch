import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { status, notes } = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {};
  if (status) data.status = status;
  if (notes !== undefined) data.notes = notes;

  const lead = await prisma.lead.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(lead);
}
