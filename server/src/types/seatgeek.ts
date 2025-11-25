// SeatGeek API Types

export interface SeatGeekVenue {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
  address?: string;
  postal_code?: string;
  location: {
    lat: number;
    lon: number;
  };
  url?: string;
  timezone?: string;
}

export interface SeatGeekPerformer {
  id: number;
  name: string;
  short_name?: string;
  image?: string;
  images?: {
    huge?: string;
    large?: string;
    medium?: string;
    small?: string;
  };
  primary?: boolean;
  score?: number;
  slug?: string;
  type?: string;
  url?: string;
}

export interface SeatGeekTaxonomy {
  id: number;
  name: string;
  parent_id?: number;
  rank?: number;
}

export interface SeatGeekStats {
  lowest_price: number | null;
  highest_price: number | null;
  average_price?: number | null;
  listing_count?: number;
  median_price?: number | null;
  lowest_sg_base_price?: number | null;
  lowest_sg_base_price_good_deals?: number | null;
}

export interface SeatGeekEvent {
  id: number;
  title: string;
  short_title?: string;
  datetime_local: string;
  datetime_utc: string;
  datetime_tbd?: boolean;
  time_tbd?: boolean;
  venue: SeatGeekVenue;
  performers: SeatGeekPerformer[];
  stats: SeatGeekStats;
  score: number;
  announce_date?: string;
  created_at?: string;
  url: string;
  type: string;
  taxonomies?: SeatGeekTaxonomy[];
  visible_until_utc?: string;
  status?: string;
  description?: string;
}

export interface SeatGeekEventSearchParams {
  q?: string;
  venue_city?: string;
  venue_state?: string;
  datetime_utc_gte?: string;
  datetime_utc_lte?: string;
  taxonomies_name?: string;
  per_page?: number;
  page?: number;
  sort?: string;
}

export interface SeatGeekSearchResponse {
  events: SeatGeekEvent[];
  meta: {
    total: number;
    took: number;
    page: number;
    per_page: number;
    geolocation?: {
      lat: number;
      lon: number;
      range?: string;
      postal_code?: string;
    };
  };
}

export interface SeatGeekTaxonomyItem {
  id: number;
  name: string;
  parent_id: number | null;
}

