import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Ensure a User row exists in our DB for the signed-in Clerk user */
async function ensureUser(clerkId: string) {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${clerkId}@noemail.shulsearch.com`;
  const name  = clerkUser ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() : undefined;

  return prisma.user.upsert({
    where:  { clerkId },
    create: { clerkId, email, name: name || null },
    update: { email, name: name || null },
  });
}

// GET /api/saved — return all saved property IDs for the current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ids: [] });

  await ensureUser(userId);

  const saved = await prisma.savedProperty.findMany({
    where: { user: { clerkId: userId } },
    select: { propertyId: true },
  });

  return NextResponse.json({ ids: saved.map((s) => s.propertyId) });
}

// POST /api/saved — toggle save/unsave a property
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { propertyId } = await req.json();
  if (!propertyId) return NextResponse.json({ error: "propertyId required" }, { status: 400 });

  const user = await ensureUser(userId);

  const existing = await prisma.savedProperty.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId } },
  });

  if (existing) {
    await prisma.savedProperty.delete({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedProperty.create({
      data: { userId: user.id, propertyId },
    });
    return NextResponse.json({ saved: true });
  }
}
