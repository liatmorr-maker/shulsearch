import { create } from "zustand";

export type ListingType = "ALL" | "SALE" | "RENT";
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

export interface FilterState {
  query: string;
  listingType: ListingType;
  maxDistanceMi: DistanceFilter;
  priceMin: number;
  priceMax: number;
  bedsMin: number;
  denomination: Denomination;
  sortBy: "proximity" | "price_asc" | "price_desc" | "newest";

  // actions
  setQuery: (q: string) => void;
  setListingType: (t: ListingType) => void;
  setMaxDistance: (d: DistanceFilter) => void;
  setPriceRange: (min: number, max: number) => void;
  setBedsMin: (b: number) => void;
  setDenomination: (d: Denomination) => void;
  setSortBy: (s: FilterState["sortBy"]) => void;
  reset: () => void;
}

const DEFAULTS = {
  query: "",
  listingType: "ALL" as ListingType,
  maxDistanceMi: null as DistanceFilter,
  priceMin: 0,
  priceMax: 10_000_000_00, // $10M
  bedsMin: 0,
  denomination: "ALL" as Denomination,
  sortBy: "proximity" as FilterState["sortBy"],
};

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULTS,

  setQuery: (q) => set({ query: q }),
  setListingType: (t) => set({ listingType: t }),
  setMaxDistance: (d) => set({ maxDistanceMi: d }),
  setPriceRange: (min, max) => set({ priceMin: min, priceMax: max }),
  setBedsMin: (b) => set({ bedsMin: b }),
  setDenomination: (d) => set({ denomination: d }),
  setSortBy: (s) => set({ sortBy: s }),
  reset: () => set({ ...DEFAULTS }),
}));
