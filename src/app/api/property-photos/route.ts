import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const RAPIDAPI_HOST = "realty-in-us.p.rapidapi.com";

function upgradePhotoUrl(url: string): string {
  if (!url.includes("rdcpix.com")) return url;
  return url.replace(/(\d+)[std]\.jpg$/, "$1o.jpg");
}

export async function GET(req: NextRequest) {
  const externalId = req.nextUrl.searchParams.get("externalId");
  if (!externalId) return NextResponse.json({ photos: [] });

  try {
    const res = await fetch(`https://${RAPIDAPI_HOST}/properties/v3/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
      body: JSON.stringify({ property_id: externalId }),
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) return NextResponse.json({ photos: [] });

    const json = await res.json();
    const home = json?.data?.home;

    const photos: string[] = [];
    if (Array.isArray(home?.photos)) {
      for (const p of home.photos) {
        const href: string | undefined = p?.href;
        if (href) photos.push(upgradePhotoUrl(href));
      }
    }
    if (photos.length === 0 && home?.primary_photo?.href) {
      photos.push(upgradePhotoUrl(home.primary_photo.href));
    }

    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
