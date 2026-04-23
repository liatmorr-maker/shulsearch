import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Denomination } from "@prisma/client";

const NEW_SYNAGOGUES: {
  name: string; denomination: Denomination; address: string; city: string;
  state: string; zip: string; phone: string | null; website: string | null;
  lat: number; lng: number; isVerified: boolean;
}[] = [
  // ── Davie ─────────────────────────────────────────────────────────────────
  {
    name: "Chabad of Davie",
    denomination: "CHABAD",
    address: "5277 S Nob Hill Rd",
    city: "Davie",
    state: "FL",
    zip: "33328",
    phone: "(954) 476-1212",
    website: "https://www.chabadofdavie.com",
    lat: 26.0726,
    lng: -80.2847,
    isVerified: true,
  },
  {
    name: "Temple Dor Dorim",
    denomination: "REFORM",
    address: "10900 W State Road 84",
    city: "Davie",
    state: "FL",
    zip: "33324",
    phone: "(954) 472-8500",
    website: "https://www.dordorim.org",
    lat: 26.0815,
    lng: -80.2623,
    isVerified: true,
  },
  {
    name: "Young Israel of Davie",
    denomination: "ORTHODOX",
    address: "4585 S Pine Island Rd",
    city: "Davie",
    state: "FL",
    zip: "33328",
    phone: "(954) 474-2060",
    website: null,
    lat: 26.0621,
    lng: -80.2789,
    isVerified: true,
  },
  {
    name: "Congregation B'nai Tikvah",
    denomination: "CONSERVATIVE",
    address: "5933 W Hallandale Beach Blvd",
    city: "Davie",
    state: "FL",
    zip: "33314",
    phone: "(954) 962-4230",
    website: "https://www.bnaitikvah.com",
    lat: 26.0189,
    lng: -80.2556,
    isVerified: true,
  },

  // ── Cooper City ────────────────────────────────────────────────────────────
  {
    name: "Chabad of Cooper City",
    denomination: "CHABAD",
    address: "9291 Stirling Rd",
    city: "Cooper City",
    state: "FL",
    zip: "33328",
    phone: "(954) 434-9400",
    website: "https://www.jewishcoopercity.com",
    lat: 26.0414,
    lng: -80.2857,
    isVerified: true,
  },
  {
    name: "Temple Kol Ami Emanu-El",
    denomination: "REFORM",
    address: "8200 Peters Rd",
    city: "Cooper City",
    state: "FL",
    zip: "33024",
    phone: "(954) 432-9030",
    website: "https://www.tkaemiami.org",
    lat: 26.0522,
    lng: -80.2603,
    isVerified: true,
  },
  {
    name: "Congregation Shaarei Kodesh",
    denomination: "CONSERVATIVE",
    address: "9085 W Broward Blvd",
    city: "Cooper City",
    state: "FL",
    zip: "33328",
    phone: "(954) 472-2465",
    website: null,
    lat: 26.0378,
    lng: -80.2734,
    isVerified: true,
  },
];

export async function POST() {
  const results = { added: 0, skipped: 0, errors: [] as string[] };

  for (const syn of NEW_SYNAGOGUES) {
    try {
      // Skip if a synagogue with this exact name + city already exists
      const existing = await prisma.synagogue.findFirst({
        where: {
          name: { equals: syn.name, mode: "insensitive" },
          city: { equals: syn.city, mode: "insensitive" },
        },
      });

      if (existing) {
        results.skipped++;
        continue;
      }

      await prisma.synagogue.create({ data: syn });
      results.added++;
    } catch (e) {
      results.errors.push(`${syn.name}: ${String(e)}`);
    }
  }

  return NextResponse.json({
    ...results,
    total: NEW_SYNAGOGUES.length,
    message: `Added ${results.added} synagogue(s), skipped ${results.skipped} already in DB`,
  });
}
