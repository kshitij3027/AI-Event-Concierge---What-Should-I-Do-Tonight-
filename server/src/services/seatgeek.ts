import { executeComposioAction, isComposioConfigured } from "./composio.js";
import type {
  SeatGeekEvent,
  SeatGeekEventSearchParams,
  SeatGeekSearchResponse,
  SeatGeekTaxonomyItem,
} from "../types/seatgeek.js";

// Correct tool slugs from Composio
const SEATGEEK_SEARCH_ACTION = "SEAT_GEEK_SEARCH_EVENTS";
const SEATGEEK_GET_EVENT_ACTION = "SEAT_GEEK_GET_EVENT_DETAILS";
const SEATGEEK_GET_TAXONOMIES_ACTION = "SEAT_GEEK_GET_TAXONOMIES";

// Check if we should use mock data
const USE_MOCK_DATA = !isComposioConfigured();

/**
 * Search for events using SeatGeek via Composio
 */
export async function searchEvents(
  params: SeatGeekEventSearchParams
): Promise<SeatGeekSearchResponse> {
  // Return mock data if Composio is not configured
  if (USE_MOCK_DATA) {
    console.log("📌 Using mock data (Composio not configured)");
    return getMockSearchResponse(params);
  }

  try {
    // Build the search parameters for Composio
    const searchParams: Record<string, unknown> = {};

    if (params.q) searchParams.q = params.q;
    if (params.venue_city) searchParams.venue_city = params.venue_city;
    if (params.venue_state) searchParams.venue_state = params.venue_state;
    if (params.datetime_utc_gte)
      searchParams.datetime_utc_gte = params.datetime_utc_gte;
    if (params.datetime_utc_lte)
      searchParams.datetime_utc_lte = params.datetime_utc_lte;
    if (params.taxonomies_name)
      searchParams.taxonomies_name = params.taxonomies_name;
    if (params.per_page) searchParams.per_page = params.per_page;
    if (params.page) searchParams.page = params.page;
    if (params.sort) searchParams.sort = params.sort;

    console.log("🔍 Searching events with params:", searchParams);

    const result = await executeComposioAction(
      SEATGEEK_SEARCH_ACTION,
      searchParams
    );

    // Parse the result - Composio returns data in a specific format
    const data = parseComposioResult(result);

    return {
      events: (data.events || []) as SeatGeekEvent[],
      meta: (data.meta || {
        total: 0,
        took: 0,
        page: params.page || 1,
        per_page: params.per_page || 20,
      }) as SeatGeekSearchResponse["meta"],
    };
  } catch (error) {
    console.error("Error searching events:", error);
    throw error;
  }
}

/**
 * Get event details by ID
 */
export async function getEventById(eventId: number): Promise<SeatGeekEvent | null> {
  // Return mock data if Composio is not configured
  if (USE_MOCK_DATA) {
    console.log("📌 Using mock data for event:", eventId);
    return getMockEventById(eventId);
  }

  try {
    console.log("📋 Getting event details for ID:", eventId);

    // Tool requires event_id as a string
    const result = await executeComposioAction(SEATGEEK_GET_EVENT_ACTION, {
      event_id: String(eventId),
    });

    const data = parseComposioResult(result);
    return (data as unknown as SeatGeekEvent) || null;
  } catch (error) {
    console.error("Error getting event by ID:", error);
    throw error;
  }
}

/**
 * Get available taxonomies (event categories)
 */
export async function getTaxonomies(): Promise<SeatGeekTaxonomyItem[]> {
  // Return default taxonomies (these don't really need the API)
  if (USE_MOCK_DATA) {
    return getDefaultTaxonomies();
  }

  try {
    console.log("📚 Getting taxonomies");

    const result = await executeComposioAction(SEATGEEK_GET_TAXONOMIES_ACTION, {});

    const data = parseComposioResult(result);
    return (data.taxonomies || []) as SeatGeekTaxonomyItem[];
  } catch (error) {
    console.error("Error getting taxonomies:", error);
    // Return default taxonomies if API fails
    return getDefaultTaxonomies();
  }
}

/**
 * Parse Composio result which may be wrapped in different formats
 */
function parseComposioResult(result: unknown): Record<string, unknown> {
  if (!result) return {};

  // If result is already an object with data property
  if (typeof result === "object" && result !== null) {
    const obj = result as Record<string, unknown>;

    // Check for nested data property (Composio wraps responses)
    if ("data" in obj && typeof obj.data === "object") {
      return obj.data as Record<string, unknown>;
    }

    // Check for response_data property
    if ("response_data" in obj && typeof obj.response_data === "object") {
      return obj.response_data as Record<string, unknown>;
    }

    // Return as-is if it looks like our expected data
    if ("events" in obj || "taxonomies" in obj || "id" in obj) {
      return obj;
    }

    return obj;
  }

  // If result is a string, try to parse it as JSON
  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch {
      return {};
    }
  }

  return {};
}

/**
 * Default taxonomies for fallback
 */
function getDefaultTaxonomies(): SeatGeekTaxonomyItem[] {
  return [
    { id: 1, name: "concert", parent_id: null },
    { id: 2, name: "sports", parent_id: null },
    { id: 3, name: "theater", parent_id: null },
    { id: 4, name: "comedy", parent_id: null },
    { id: 5, name: "classical", parent_id: null },
    { id: 6, name: "family", parent_id: null },
    { id: 7, name: "festival", parent_id: null },
  ];
}

/**
 * Filter events by price range (post-processing)
 */
export function filterEventsByPrice(
  events: SeatGeekEvent[],
  minPrice?: number,
  maxPrice?: number
): SeatGeekEvent[] {
  return events.filter((event) => {
    const lowestPrice = event.stats?.lowest_price;

    // If no price info, include the event
    if (lowestPrice === null || lowestPrice === undefined) {
      return true;
    }

    // Apply min price filter
    if (minPrice !== undefined && lowestPrice < minPrice) {
      return false;
    }

    // Apply max price filter
    if (maxPrice !== undefined && lowestPrice > maxPrice) {
      return false;
    }

    return true;
  });
}

/**
 * Sort events by score (popularity)
 */
export function sortEventsByScore(
  events: SeatGeekEvent[],
  ascending: boolean = false
): SeatGeekEvent[] {
  return [...events].sort((a, b) => {
    if (ascending) {
      return (a.score || 0) - (b.score || 0);
    }
    return (b.score || 0) - (a.score || 0);
  });
}

// ==================== MOCK DATA ====================

/**
 * Generate mock events for testing without Composio API key
 */
function getMockSearchResponse(params: SeatGeekEventSearchParams): SeatGeekSearchResponse {
  const now = new Date();
  const mockEvents: SeatGeekEvent[] = [
    {
      id: 1001,
      title: "Taylor Swift | The Eras Tour",
      short_title: "Taylor Swift",
      datetime_local: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 1,
        name: "Madison Square Garden",
        city: params.venue_city || "New York",
        state: params.venue_state || "NY",
        country: "US",
        address: "4 Pennsylvania Plaza",
        postal_code: "10001",
        location: { lat: 40.7505, lon: -73.9934 },
      },
      performers: [
        {
          id: 101,
          name: "Taylor Swift",
          image: "https://chairnerd.global.ssl.fastly.net/images/performers-landscape/taylor-swift-a0e4a6/14/huge.jpg",
          images: {
            huge: "https://chairnerd.global.ssl.fastly.net/images/performers-landscape/taylor-swift-a0e4a6/14/huge.jpg",
            large: "https://chairnerd.global.ssl.fastly.net/images/performers-landscape/taylor-swift-a0e4a6/14/large.jpg",
          },
          primary: true,
          score: 0.95,
        },
      ],
      stats: {
        lowest_price: 250,
        highest_price: 1500,
        average_price: 650,
        listing_count: 1234,
      },
      score: 0.95,
      url: "https://seatgeek.com/taylor-swift-tickets",
      type: "concert",
      taxonomies: [{ id: 1, name: "concert" }],
    },
    {
      id: 1002,
      title: "New York Knicks vs Los Angeles Lakers",
      short_title: "Knicks vs Lakers",
      datetime_local: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 1,
        name: "Madison Square Garden",
        city: params.venue_city || "New York",
        state: params.venue_state || "NY",
        country: "US",
        location: { lat: 40.7505, lon: -73.9934 },
      },
      performers: [
        {
          id: 201,
          name: "New York Knicks",
          image: "https://chairnerd.global.ssl.fastly.net/images/performers-landscape/new-york-knicks-a3accc/15301/huge.jpg",
          primary: true,
        },
        {
          id: 202,
          name: "Los Angeles Lakers",
          image: "https://chairnerd.global.ssl.fastly.net/images/performers-landscape/los-angeles-lakers-6add5c/15275/huge.jpg",
        },
      ],
      stats: {
        lowest_price: 89,
        highest_price: 850,
        listing_count: 567,
      },
      score: 0.88,
      url: "https://seatgeek.com/nba-tickets",
      type: "nba",
      taxonomies: [{ id: 2, name: "sports" }],
    },
    {
      id: 1003,
      title: "Hamilton - The Musical",
      short_title: "Hamilton",
      datetime_local: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 2,
        name: "Richard Rodgers Theatre",
        city: params.venue_city || "New York",
        state: params.venue_state || "NY",
        country: "US",
        address: "226 W 46th St",
        location: { lat: 40.7590, lon: -73.9870 },
      },
      performers: [
        {
          id: 301,
          name: "Hamilton",
          image: "https://chairnerd.global.ssl.fastly.net/images/performers-landscape/hamilton-new-york-1d7d63/529030/huge.jpg",
          primary: true,
        },
      ],
      stats: {
        lowest_price: 199,
        highest_price: 899,
        listing_count: 245,
      },
      score: 0.92,
      url: "https://seatgeek.com/hamilton-tickets",
      type: "broadway",
      taxonomies: [{ id: 3, name: "theater" }],
    },
    {
      id: 1004,
      title: "Dave Chappelle Live",
      short_title: "Dave Chappelle",
      datetime_local: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 3,
        name: "Radio City Music Hall",
        city: params.venue_city || "New York",
        state: params.venue_state || "NY",
        country: "US",
        location: { lat: 40.7600, lon: -73.9800 },
      },
      performers: [
        {
          id: 401,
          name: "Dave Chappelle",
          image: "https://chairnerd.global.ssl.fastly.net/images/performers-landscape/dave-chappelle-3e1e4e/29735/huge.jpg",
          primary: true,
        },
      ],
      stats: {
        lowest_price: 125,
        highest_price: 450,
        listing_count: 189,
      },
      score: 0.85,
      url: "https://seatgeek.com/dave-chappelle-tickets",
      type: "comedy",
      taxonomies: [{ id: 4, name: "comedy" }],
    },
    {
      id: 1005,
      title: "New York Philharmonic - Beethoven's 9th",
      short_title: "NY Philharmonic",
      datetime_local: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 4,
        name: "David Geffen Hall",
        city: params.venue_city || "New York",
        state: params.venue_state || "NY",
        country: "US",
        location: { lat: 40.7725, lon: -73.9835 },
      },
      performers: [
        {
          id: 501,
          name: "New York Philharmonic",
          primary: true,
        },
      ],
      stats: {
        lowest_price: 45,
        highest_price: 225,
        listing_count: 312,
      },
      score: 0.75,
      url: "https://seatgeek.com/philharmonic-tickets",
      type: "classical_orchestral_instrumental",
      taxonomies: [{ id: 5, name: "classical" }],
    },
    {
      id: 1006,
      title: "Disney On Ice: Find Your Hero",
      short_title: "Disney On Ice",
      datetime_local: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 5,
        name: "Barclays Center",
        city: params.venue_city || "Brooklyn",
        state: params.venue_state || "NY",
        country: "US",
        location: { lat: 40.6828, lon: -73.9758 },
      },
      performers: [
        {
          id: 601,
          name: "Disney On Ice",
          primary: true,
        },
      ],
      stats: {
        lowest_price: 35,
        highest_price: 150,
        listing_count: 456,
      },
      score: 0.78,
      url: "https://seatgeek.com/disney-on-ice-tickets",
      type: "family",
      taxonomies: [{ id: 6, name: "family" }],
    },
  ];

  // Filter by taxonomy if specified
  let filteredEvents = mockEvents;
  if (params.taxonomies_name) {
    const taxonomyNames = params.taxonomies_name.toLowerCase().split(',');
    filteredEvents = mockEvents.filter(event => 
      event.taxonomies?.some(t => taxonomyNames.includes(t.name.toLowerCase()))
    );
  }

  // Filter by search query
  if (params.q) {
    const query = params.q.toLowerCase();
    filteredEvents = filteredEvents.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.performers.some(p => p.name.toLowerCase().includes(query))
    );
  }

  return {
    events: filteredEvents,
    meta: {
      total: filteredEvents.length,
      took: 15,
      page: params.page || 1,
      per_page: params.per_page || 20,
    },
  };
}

/**
 * Get a mock event by ID
 */
function getMockEventById(eventId: number): SeatGeekEvent | null {
  const mockResponse = getMockSearchResponse({});
  return mockResponse.events.find(e => e.id === eventId) || null;
}
