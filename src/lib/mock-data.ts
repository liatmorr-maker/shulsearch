export type WorshipType = "SYNAGOGUE" | "CHURCH" | "MOSQUE" | "TEMPLE";

export interface MockSynagogue {
  id: string;
  name: string;
  denomination: string;
  worshipType?: WorshipType;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  website?: string;
  lat: number;
  lng: number;
  isVerified: boolean;
}

export interface MockProperty {
  id: string;
  externalId?: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  neighborhood?: string;
  lat: number;
  lng: number;
  listingType: "SALE" | "RENT";
  status: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  yearBuilt?: number;
  imageUrls: string[];
  amenities?: string[];
  isApproved: boolean;
  isFeatured: boolean;
  nearestSynagogueId?: string;
  nearestSynagugueDist?: number;
  nearestChurchId?: string;
  nearestChurchDist?: number;
  nearestMosqueId?: string;
  nearestMosqueDist?: number;
  nearestTempleId?: string;
  nearestTempleDist?: number;
  synagogueCount1mi: number;
  proximityScore?: number;
  synagogueDistances?: {
    synagogueId: string;
    synagogue: MockSynagogue;
    distanceMi: number;
    walkMinutes: number;
  }[];
}

export const SYNAGOGUES: MockSynagogue[] = [
  // ── Aventura / North Miami Beach ────────────────────────────────────────────
  { id: "syn_001", name: "Young Israel of Aventura",                        denomination: "MODERN_ORTHODOX", address: "3575 NE 207th St",         city: "Aventura",          state: "FL", zip: "33180", phone: "(305) 937-0030", lat: 25.9756, lng: -80.1451, isVerified: true  },
  { id: "syn_002", name: "Aventura Turnberry Jewish Center",                denomination: "CONSERVATIVE",    address: "20400 NE 30th Ave",        city: "Aventura",          state: "FL", zip: "33180", phone: "(305) 931-0986", lat: 25.9581, lng: -80.1356, isVerified: true  },
  { id: "syn_003", name: "Beth Torah Benny Rok Campus",                     denomination: "CONSERVATIVE",    address: "20350 NE 26th Ave",        city: "North Miami Beach", state: "FL", zip: "33180", phone: "(305) 932-2829", lat: 25.9556, lng: -80.1367, isVerified: true  },
  { id: "syn_004", name: "Chabad of Aventura",                              denomination: "CHABAD",          address: "21001 Biscayne Blvd",      city: "Aventura",          state: "FL", zip: "33180", phone: "(305) 682-2222", lat: 25.9637, lng: -80.1418, isVerified: true  },
  // ── Surfside / Bal Harbour ───────────────────────────────────────────────────
  { id: "syn_005", name: "Shul of Bal Harbour",                             denomination: "ORTHODOX",        address: "9540 Collins Ave",         city: "Surfside",          state: "FL", zip: "33154", phone: "(305) 868-1411", lat: 25.8812, lng: -80.1218, isVerified: true  },
  // ── Sunny Isles Beach ────────────────────────────────────────────────────────
  { id: "syn_006", name: "Chabad of Sunny Isles Beach",                     denomination: "CHABAD",          address: "17555 Atlantic Blvd",      city: "Sunny Isles Beach", state: "FL", zip: "33160", phone: "(305) 947-6500", lat: 25.9336, lng: -80.1381, isVerified: true  },
  { id: "syn_007", name: "Young Israel of Sunny Isles",                     denomination: "ORTHODOX",        address: "271 174th St",             city: "Sunny Isles Beach", state: "FL", zip: "33160", phone: "(305) 948-3552", lat: 25.9302, lng: -80.1247, isVerified: true  },
  // ── Boca Raton ───────────────────────────────────────────────────────────────
  { id: "syn_008", name: "Temple Beth El of Boca Raton",                    denomination: "REFORM",          address: "333 SW 4th Ave",           city: "Boca Raton",        state: "FL", zip: "33432", phone: "(561) 391-8900", lat: 26.3453, lng: -80.0987, isVerified: true  },
  { id: "syn_009", name: "Boca Raton Synagogue (BRS)",                      denomination: "MODERN_ORTHODOX", address: "7900 Montoya Cir N",        city: "Boca Raton",        state: "FL", zip: "33433", phone: "(561) 394-5732", lat: 26.3602, lng: -80.1423, isVerified: true  },
  { id: "syn_010", name: "Chabad of Boca Raton",                            denomination: "CHABAD",          address: "17950 N Military Trail",   city: "Boca Raton",        state: "FL", zip: "33496", phone: "(561) 994-6257", lat: 26.4019, lng: -80.1318, isVerified: true  },
  { id: "syn_011", name: "Anshei Shalom West",                              denomination: "CONSERVATIVE",    address: "8209 Jog Rd",              city: "Boynton Beach",     state: "FL", zip: "33472", phone: "(561) 736-7000", lat: 26.4789, lng: -80.1456, isVerified: false },
  // ── Coral Springs / Broward ──────────────────────────────────────────────────
  { id: "syn_012", name: "Broward Central Synagogue",                       denomination: "REFORM",          address: "2151 Riverside Dr",        city: "Coral Springs",     state: "FL", zip: "33071", phone: "(954) 341-7882", lat: 26.2620, lng: -80.2534, isVerified: true  },
  // ── Hollywood / Fort Lauderdale ──────────────────────────────────────────────
  { id: "syn_013", name: "Young Israel of Hollywood-Fort Lauderdale",       denomination: "ORTHODOX",        address: "3291 Stirling Rd",         city: "Fort Lauderdale",   state: "FL", zip: "33312", lat: 26.0112, lng: -80.2081, isVerified: true  },
  { id: "syn_014", name: "Hollywood Community Synagogue Chabad",            denomination: "CHABAD",          address: "4441 Sheridan St",         city: "Hollywood",         state: "FL", zip: "33021", lat: 26.0190, lng: -80.1694, isVerified: true  },
  { id: "syn_015", name: "Chabad Lubavitch of Hollywood",                   denomination: "CHABAD",          address: "2221 N 46th Ave",          city: "Hollywood",         state: "FL", zip: "33021", lat: 26.0130, lng: -80.1728, isVerified: false },
  { id: "syn_016", name: "The Shul of Hollywood Hills",                     denomination: "ORTHODOX",        address: "2215 N 46th Ave",          city: "Hollywood",         state: "FL", zip: "33021", lat: 26.0140, lng: -80.1728, isVerified: true  },
  { id: "syn_017", name: "Young Israel of Hollywood Beach (Beach Shul)",    denomination: "ORTHODOX",        address: "315 Madison St",           city: "Hollywood",         state: "FL", zip: "33022", lat: 26.0145, lng: -80.1190, isVerified: true  },
  { id: "syn_018", name: "B'nai Sephardim Synagogue",                       denomination: "SEPHARDIC",       address: "3670 Stirling Rd",         city: "Fort Lauderdale",   state: "FL", zip: "33312", lat: 26.0112, lng: -80.2120, isVerified: true  },
  { id: "syn_019", name: "Temple Sinai of Hollywood",                       denomination: "CONSERVATIVE",    address: "1400 N 46th Ave",          city: "Hollywood",         state: "FL", zip: "33021", lat: 26.0201, lng: -80.1732, isVerified: true  },
  { id: "syn_020", name: "Temple Beth El of Hollywood",                     denomination: "CONSERVATIVE",    address: "1351 S 14th Ave",          city: "Hollywood",         state: "FL", zip: "33020", lat: 26.0040, lng: -80.1541, isVerified: true  },
  { id: "syn_021", name: "Temple Solel",                                    denomination: "REFORM",          address: "5100 Sheridan St",         city: "Hollywood",         state: "FL", zip: "33021", lat: 26.0190, lng: -80.1813, isVerified: true  },
  { id: "syn_022", name: "Ramat Shalom Beth Israel",                        denomination: "REFORM",          address: "11301 W Broward Blvd",     city: "Plantation",        state: "FL", zip: "33325", lat: 26.1182, lng: -80.2652, isVerified: true  },
  { id: "syn_023", name: "Congregation Beth T'Fillah",                      denomination: "CONSERVATIVE",    address: "1926 Hollywood Blvd",      city: "Hollywood",         state: "FL", zip: "33020", lat: 26.0112, lng: -80.1558, isVerified: true  },
  { id: "syn_024", name: "Beth Moshe Congregation",                         denomination: "ORTHODOX",        address: "2225 NE 121st St",         city: "North Miami",       state: "FL", zip: "33181", lat: 25.8990, lng: -80.1630, isVerified: false },
  { id: "syn_025", name: "Aish HaTorah South Florida",                      denomination: "ORTHODOX",        address: "4010 N 46th Ave",          city: "Hollywood",         state: "FL", zip: "33021", lat: 26.0190, lng: -80.1728, isVerified: true  },
];

const synMap = Object.fromEntries(SYNAGOGUES.map((s) => [s.id, s]));

export const PROPERTIES: MockProperty[] = [
  {
    id: "prop_001",
    title: "Spacious 3BR – Steps from Shul",
    address: "19370 Collins Ave #1804",
    city: "Sunny Isles Beach", state: "FL", zip: "33160", neighborhood: "Sunny Isles Beach",
    lat: 25.9480, lng: -80.1215,
    listingType: "SALE", status: "ACTIVE",
    price: 64900000, beds: 3, baths: 2.5, sqft: 1820, yearBuilt: 2008,
    imageUrls: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
    ],
    isApproved: true, isFeatured: true,
    nearestSynagogueId: "syn_007", nearestSynagugueDist: 0.38, synagogueCount1mi: 3, proximityScore: 18.4,
    synagogueDistances: [
      { synagogueId: "syn_007", synagogue: synMap["syn_007"], distanceMi: 0.38, walkMinutes: 8 },
      { synagogueId: "syn_006", synagogue: synMap["syn_006"], distanceMi: 0.61, walkMinutes: 12 },
      { synagogueId: "syn_005", synagogue: synMap["syn_005"], distanceMi: 1.21, walkMinutes: 24 },
    ],
  },
  {
    id: "prop_002",
    title: "Modern 2BR Condo | Walk to Chabad",
    address: "3000 Island Blvd #2103",
    city: "Aventura", state: "FL", zip: "33160", neighborhood: "Williams Island",
    lat: 25.9542, lng: -80.1273,
    listingType: "SALE", status: "ACTIVE",
    price: 48500000, beds: 2, baths: 2.0, sqft: 1350, yearBuilt: 2012,
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    ],
    isApproved: true, isFeatured: false,
    nearestSynagogueId: "syn_006", nearestSynagugueDist: 0.52, synagogueCount1mi: 2, proximityScore: 12.7,
    synagogueDistances: [
      { synagogueId: "syn_006", synagogue: synMap["syn_006"], distanceMi: 0.52, walkMinutes: 10 },
      { synagogueId: "syn_007", synagogue: synMap["syn_007"], distanceMi: 0.73, walkMinutes: 15 },
    ],
  },
  {
    id: "prop_003",
    title: "Luxury Rental – Turnberry Area",
    address: "20505 E Country Club Dr #1802",
    city: "Aventura", state: "FL", zip: "33180", neighborhood: "Aventura",
    lat: 25.9573, lng: -80.1347,
    listingType: "RENT", status: "ACTIVE",
    price: 450000, beds: 2, baths: 2.0, sqft: 1200, yearBuilt: 2015,
    imageUrls: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    ],
    isApproved: true, isFeatured: true,
    nearestSynagogueId: "syn_002", nearestSynagugueDist: 0.21, synagogueCount1mi: 4, proximityScore: 26.5,
    synagogueDistances: [
      { synagogueId: "syn_002", synagogue: synMap["syn_002"], distanceMi: 0.21, walkMinutes: 4 },
      { synagogueId: "syn_003", synagogue: synMap["syn_003"], distanceMi: 0.34, walkMinutes: 7 },
      { synagogueId: "syn_001", synagogue: synMap["syn_001"], distanceMi: 0.48, walkMinutes: 10 },
      { synagogueId: "syn_004", synagogue: synMap["syn_004"], distanceMi: 0.67, walkMinutes: 13 },
    ],
  },
  {
    id: "prop_004",
    title: "Family Home – Near YIAB",
    address: "3300 NE 190th St",
    city: "Aventura", state: "FL", zip: "33180", neighborhood: "Aventura",
    lat: 25.9622, lng: -80.1389,
    listingType: "SALE", status: "ACTIVE",
    price: 89500000, beds: 4, baths: 3.0, sqft: 2600, yearBuilt: 1998,
    imageUrls: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
    ],
    isApproved: true, isFeatured: false,
    nearestSynagogueId: "syn_001", nearestSynagugueDist: 0.07, synagogueCount1mi: 5, proximityScore: 32.1,
    synagogueDistances: [
      { synagogueId: "syn_001", synagogue: synMap["syn_001"], distanceMi: 0.07, walkMinutes: 2 },
      { synagogueId: "syn_004", synagogue: synMap["syn_004"], distanceMi: 0.23, walkMinutes: 5 },
      { synagogueId: "syn_002", synagogue: synMap["syn_002"], distanceMi: 0.45, walkMinutes: 9 },
      { synagogueId: "syn_003", synagogue: synMap["syn_003"], distanceMi: 0.52, walkMinutes: 10 },
      { synagogueId: "syn_006", synagogue: synMap["syn_006"], distanceMi: 1.38, walkMinutes: 28 },
    ],
  },
  {
    id: "prop_005",
    title: "Cozy 1BR Rental – Sunny Isles",
    address: "17555 Collins Ave #904",
    city: "Sunny Isles Beach", state: "FL", zip: "33160", neighborhood: "Sunny Isles Beach",
    lat: 25.9362, lng: -80.1225,
    listingType: "RENT", status: "ACTIVE",
    price: 280000, beds: 1, baths: 1.0, sqft: 780, yearBuilt: 2005,
    imageUrls: ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"],
    isApproved: true, isFeatured: false,
    nearestSynagogueId: "syn_006", nearestSynagugueDist: 0.29, synagogueCount1mi: 2, proximityScore: 18.8,
    synagogueDistances: [
      { synagogueId: "syn_006", synagogue: synMap["syn_006"], distanceMi: 0.29, walkMinutes: 6 },
      { synagogueId: "syn_007", synagogue: synMap["syn_007"], distanceMi: 0.65, walkMinutes: 13 },
    ],
  },
  {
    id: "prop_006",
    title: "Boca Raton Estate – Near BRS",
    address: "7750 Montoya Cir",
    city: "Boca Raton", state: "FL", zip: "33433", neighborhood: "Boca",
    lat: 26.3588, lng: -80.1411,
    listingType: "SALE", status: "ACTIVE",
    price: 179900000, beds: 5, baths: 4.5, sqft: 4200, yearBuilt: 2001,
    imageUrls: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800",
    ],
    isApproved: true, isFeatured: true,
    nearestSynagogueId: "syn_009", nearestSynagugueDist: 0.15, synagogueCount1mi: 3, proximityScore: 28.3,
    synagogueDistances: [
      { synagogueId: "syn_009", synagogue: synMap["syn_009"], distanceMi: 0.15, walkMinutes: 3 },
      { synagogueId: "syn_008", synagogue: synMap["syn_008"], distanceMi: 0.88, walkMinutes: 18 },
      { synagogueId: "syn_010", synagogue: synMap["syn_010"], distanceMi: 1.44, walkMinutes: 29 },
    ],
  },
  {
    id: "prop_007",
    title: "Updated 3BR Townhouse – Boca",
    address: "6300 NW 2nd Ave",
    city: "Boca Raton", state: "FL", zip: "33487", neighborhood: "East Boca",
    lat: 26.3942, lng: -80.0876,
    listingType: "SALE", status: "ACTIVE",
    price: 55000000, beds: 3, baths: 2.5, sqft: 1950, yearBuilt: 1995,
    imageUrls: [
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    isApproved: true, isFeatured: false,
    nearestSynagogueId: "syn_010", nearestSynagugueDist: 0.72, synagogueCount1mi: 2, proximityScore: 9.5,
    synagogueDistances: [
      { synagogueId: "syn_010", synagogue: synMap["syn_010"], distanceMi: 0.72, walkMinutes: 14 },
      { synagogueId: "syn_009", synagogue: synMap["syn_009"], distanceMi: 1.31, walkMinutes: 26 },
    ],
  },
  {
    id: "prop_008",
    title: "Penthouse – Ocean View, Sunny Isles",
    address: "16901 Collins Ave #4801",
    city: "Sunny Isles Beach", state: "FL", zip: "33160", neighborhood: "Sunny Isles Beach",
    lat: 25.9298, lng: -80.1219,
    listingType: "SALE", status: "ACTIVE",
    price: 349000000, beds: 4, baths: 4.5, sqft: 3800, yearBuilt: 2018,
    imageUrls: [
      "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800",
    ],
    isApproved: true, isFeatured: true,
    nearestSynagogueId: "syn_007", nearestSynagugueDist: 0.44, synagogueCount1mi: 2, proximityScore: 15.2,
    synagogueDistances: [
      { synagogueId: "syn_007", synagogue: synMap["syn_007"], distanceMi: 0.44, walkMinutes: 9 },
      { synagogueId: "syn_006", synagogue: synMap["syn_006"], distanceMi: 0.91, walkMinutes: 18 },
    ],
  },
];
