import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal passthrough middleware — auth handled at page level
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
