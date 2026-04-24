import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ signedIn: false });

    const user = await currentUser();
    return NextResponse.json({
      signedIn: true,
      userId,
      emails: user?.emailAddresses?.map((e) => e.emailAddress),
      primaryEmail: user?.emailAddresses?.[0]?.emailAddress,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
