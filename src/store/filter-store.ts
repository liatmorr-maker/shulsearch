import { create } from "zustand";

export type ListingType = "ALL" | "SALE" | "RENT";
export type WorshipType = "SYNAGOGUE" | "CHURCH" | "MOSQUE";
export type Denomination =
  | "ALL"
  | "ORTHODOX"
  | "MODERN_ORTHODOX"
  | "CONSERVATIVE"
  | "REFORM"
  | "RECONSTRUCTIONIST"
  | "SEPHARDIC"
  | "CHABAD"
  | "OTHER";

export type DistanceFilter = 0.25 | 0.5 | 1 | 1.5 | null;

export const HOME_TYPES = [
  { label: "Houses",        keywords: ["single family", "house"] },
  { label: "Townhomes",     keywords: ["townhouse", "townhome"] },
  { label: "Multi-family",  keywords: ["multi family", "multi-family", "duplex", "triplex"] },
  { label: "Land/Lots",     keywords: ["land", "lot"] },
  { label: "Apartments",    keywords: ["apartment"] },
  { label: "Condo/Co-ops",  keywords: ["condo", "co-op", "cooperative"] },
  { label: "Manufactured",  keywords: ["manufactured", "mobile home"] },
] as const;

export type HomeTypeLabel = (typeof HOME_TYPES)[number]["label"];

export interface FilterState {
  query: string;
  listingType: ListingType;
  worshipType: WorshipType;
  maxDistanceMi: DistanceFilter;
  priceMin: number;
  priceMax: number;
  bedsMin: number;
  bathsMin: number;
  denomination: Denomination;
  homeTypes: HomeTypeLabel[];   // empty = all types
  sortBy: "proximity" | "price_asc" | "price_desc" | "newest";

  // actions
  setQuery: (q: string) => void;
  setListingType: (t: ListingType) => void;
  setWorshipType: (t: WorshipType) => void;
  setMaxDistance: (d: DistanceFilter) => void;
  setPriceRange: (min: number, max: number) => void;
  setBedsMin: (b: number) => void;
  setBathsMin: (b: number) => void;
  setDenomination: (d: Denomination) => void;
  setHomeTypes: (types: HomeTypeLabel[]) => void;
  setSortBy: (s: FilterState["sortBy"]) => void;
  reset: () => void;
}

export const ALL_HOME_TYPES = HOME_TYPES.map((h) => h.label) as HomeTypeLabel[];

const DEFAULTS = {
  query: "",
  listingType: "ALL" as ListingType,
  worshipType: "SYNAGOGUE" as WorshipType,
  maxDistanceMi: null as DistanceFilter,
  priceMin: 0,
  priceMax: 10_000_000_00, // $10M
  bedsMin: 0,
  bathsMin: 0,
  denomination: "ALL" as Denomination,
  homeTypes: ALL_HOME_TYPES, // all checked by default
  sortBy: "proximity" as FilterState["sortBy"],
};

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULTS,

  setQuery:       (q) => set({ query: q }),
  setListingType: (t) => set({ listingType: t }),
  setWorshipType: (t) => set({ worshipType: t, maxDistanceMi: null, denomination: "ALL" }),
  setMaxDistance: (d) => set({ maxDistanceMi: d }),
  setPriceRange:  (min, max) => set({ priceMin: min, priceMax: max }),
  setBedsMin:     (b) => set({ bedsMin: b }),
  setBathsMin:    (b) => set({ bathsMin: b }),
  setDenomination:(d) => set({ denomination: d }),
  setHomeTypes:   (types) => set({ homeTypes: types }),
  setSortBy:      (s) => set({ sortBy: s }),
  reset:          () => set({ ...DEFAULTS }),
}));
