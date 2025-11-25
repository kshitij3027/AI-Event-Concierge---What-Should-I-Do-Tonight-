// SeatGeek Event Types for Frontend

export interface EventVenue {
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

export interface EventPerformer {
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

export interface EventTaxonomy {
  id: number;
  name: string;
  parent_id?: number;
  rank?: number;
}

export interface EventStats {
  lowest_price: number | null;
  highest_price: number | null;
  average_price?: number | null;
  listing_count?: number;
  median_price?: number | null;
}

export interface Event {
  id: number;
  title: string;
  short_title?: string;
  datetime_local: string;
  datetime_utc: string;
  datetime_tbd?: boolean;
  time_tbd?: boolean;
  venue: EventVenue;
  performers: EventPerformer[];
  stats: EventStats;
  score: number;
  announce_date?: string;
  created_at?: string;
  url: string;
  type: string;
  taxonomies?: EventTaxonomy[];
  visible_until_utc?: string;
  status?: string;
  description?: string;
}

export interface EventSearchParams {
  q?: string;
  city?: string;
  state?: string;
  date_from?: string;
  date_to?: string;
  taxonomy?: string;
  per_page?: number;
  page?: number;
  sort?: string;
  min_price?: number;
  max_price?: number;
}

export interface EventSearchMeta {
  total: number;
  took: number;
  page: number;
  per_page: number;
  filtered_count?: number;
}

export interface EventSearchResponse {
  success: boolean;
  data: {
    events: Event[];
    meta: EventSearchMeta;
  };
}

export interface EventDetailResponse {
  success: boolean;
  data: Event;
}

export interface TaxonomyItem {
  id: number;
  name: string;
  parent_id: number | null;
}

export interface TaxonomiesResponse {
  success: boolean;
  data: {
    taxonomies: TaxonomyItem[];
  };
}

// Helper type for date filters
export type DateFilter = 'tonight' | 'tomorrow' | 'weekend' | 'week' | 'month' | 'custom';

// UI state for discovery page
export interface DiscoveryFilters {
  query: string;
  taxonomy: string;
  dateFilter: DateFilter;
  customDateFrom?: string;
  customDateTo?: string;
  minPrice?: number;
  maxPrice?: number;
}

