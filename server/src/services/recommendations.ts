import { executeComposioAction, isComposioConfigured } from "./composio.js";
import { searchEvents, filterEventsByPrice, sortEventsByScore } from "./seatgeek.js";
import type { SeatGeekEvent, SeatGeekEventSearchParams } from "../types/seatgeek.js";

// SeatGeek tool slugs
const SEATGEEK_GET_RECOMMENDATIONS = "SEAT_GEEK_GET_EVENT_RECOMMENDATIONS";
const SEATGEEK_SEARCH_PERFORMERS = "SEAT_GEEK_SEARCH_PERFORMERS";

// Mood to taxonomy mapping
const MOOD_TAXONOMY_MAP = {
  highEnergy: ["concert", "sports", "edm", "festival"],
  lowEnergy: ["theater", "classical", "comedy", "jazz"],
  social: ["sports", "concert", "festival", "family"],
  intimate: ["theater", "classical", "comedy", "jazz"],
} as const;

// Budget thresholds for filtering
const BUDGET_THRESHOLDS = {
  low: { min: 0, max: 75 },
  medium: { min: 50, max: 200 },
  high: { min: 150, max: 1000 },
} as const;

export interface MoodParams {
  energy: "high" | "low" | "any"; // Energy level
  social: "group" | "intimate" | "any"; // Social setting
  budget: "low" | "medium" | "high" | "any"; // Spending level
}

export interface RecommendationParams {
  lat?: number;
  lon?: number;
  city?: string;
  state?: string;
  interests?: string[]; // Taxonomy names
  performerIds?: number[];
  eventId?: number;
  perPage?: number;
  page?: number;
}

export interface RecommendationResult {
  events: SeatGeekEvent[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    source: "recommendations" | "search" | "mock";
  };
}

const USE_MOCK_DATA = !isComposioConfigured();

/**
 * Get personalized recommendations based on user location and interests
 */
export async function getPersonalizedRecommendations(
  params: RecommendationParams
): Promise<RecommendationResult> {
  if (USE_MOCK_DATA) {
    console.log("📌 Using mock data for personalized recommendations");
    return getMockPersonalizedRecommendations(params);
  }

  try {
    const { lat, lon, interests, performerIds, perPage = 12, page = 1 } = params;

    // Try to use the recommendations endpoint with location/performer seeds
    if ((lat && lon) || (performerIds && performerIds.length > 0)) {
      const recommendParams: Record<string, unknown> = {
        per_page: perPage,
        page,
      };

      if (lat && lon) {
        recommendParams.lat = lat;
        recommendParams.lon = lon;
      }

      if (performerIds && performerIds.length > 0) {
        recommendParams.performers_id = performerIds.slice(0, 5).join(",");
      }

      console.log("🎯 Getting recommendations with params:", recommendParams);

      const result = await executeComposioAction(
        SEATGEEK_GET_RECOMMENDATIONS,
        recommendParams
      );

      const data = parseComposioResult(result);
      let events: SeatGeekEvent[] = [];

      // Handle nested format from SeatGeek recommendations API: { event: {...}, score: ... }
      if (data.recommendations && Array.isArray(data.recommendations)) {
        events = (data.recommendations as Array<{ event?: SeatGeekEvent }>)
          .filter((r) => r.event)
          .map((r) => r.event as SeatGeekEvent);
      } else {
        events = (data.events || []) as SeatGeekEvent[];
      }

      // Filter by interests if specified
      let filteredEvents = events;
      if (interests && interests.length > 0) {
        filteredEvents = events.filter((event) =>
          event.taxonomies?.some((t) =>
            interests.includes(t.name.toLowerCase())
          )
        );
      }

      return {
        events: filteredEvents,
        meta: {
          total: filteredEvents.length,
          page,
          perPage,
          source: "recommendations",
        },
      };
    }

    // Fall back to search if no location/performer data
    const searchParams: SeatGeekEventSearchParams = {
      venue_city: params.city,
      venue_state: params.state,
      per_page: perPage,
      page,
      sort: "score.desc",
    };

    if (interests && interests.length > 0) {
      searchParams.taxonomies_name = interests.join(",");
    }

    const searchResult = await searchEvents(searchParams);
    const sortedEvents = sortEventsByScore(searchResult.events);

    return {
      events: sortedEvents,
      meta: {
        total: searchResult.meta.total,
        page,
        perPage,
        source: "search",
      },
    };
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    throw error;
  }
}

/**
 * Get trending events sorted by score (popularity)
 */
export async function getTrendingEvents(
  params: RecommendationParams
): Promise<RecommendationResult> {
  if (USE_MOCK_DATA) {
    console.log("📌 Using mock data for trending events");
    return getMockTrendingEvents(params);
  }

  try {
    const { city, state, perPage = 10, page = 1 } = params;

    const searchParams: SeatGeekEventSearchParams = {
      per_page: perPage,
      page,
      sort: "score.desc",
    };

    if (city) searchParams.venue_city = city;
    if (state) searchParams.venue_state = state;

    console.log("🔥 Getting trending events with params:", searchParams);

    const result = await searchEvents(searchParams);
    // Sort by score descending for "trending"
    const sortedEvents = sortEventsByScore(result.events);

    return {
      events: sortedEvents,
      meta: {
        total: result.meta.total,
        page,
        perPage,
        source: "search",
      },
    };
  } catch (error) {
    console.error("Error getting trending events:", error);
    throw error;
  }
}

/**
 * Get similar events based on a specific event ID
 */
export async function getSimilarEvents(
  eventId: number,
  params: RecommendationParams = {}
): Promise<RecommendationResult> {
  if (USE_MOCK_DATA) {
    console.log("📌 Using mock data for similar events");
    return getMockSimilarEvents(eventId, params);
  }

  try {
    const { perPage = 6, page = 1 } = params;

    console.log("🎯 Getting similar events for event ID:", eventId);

    // Use the recommendations endpoint with event_id as seed
    const result = await executeComposioAction(SEATGEEK_GET_RECOMMENDATIONS, {
      events_id: String(eventId),
      per_page: perPage,
      page,
    });

    const data = parseComposioResult(result);
    let events: SeatGeekEvent[] = [];

    // Handle nested format from SeatGeek recommendations API: { event: {...}, score: ... }
    if (data.recommendations && Array.isArray(data.recommendations)) {
      events = (data.recommendations as Array<{ event?: SeatGeekEvent }>)
        .filter((r) => r.event)
        .map((r) => r.event as SeatGeekEvent);
    } else {
      events = (data.events || []) as SeatGeekEvent[];
    }

    return {
      events: events.filter((e) => e.id !== eventId), // Exclude the source event
      meta: {
        total: events.length,
        page,
        perPage,
        source: "recommendations",
      },
    };
  } catch (error) {
    console.error("Error getting similar events:", error);
    // Fall back to search with same taxonomy
    return getFallbackSimilarEvents(eventId, params);
  }
}

/**
 * Get "hidden gems" - events with lower score but high listing count
 * These are quality events that aren't as mainstream
 */
export async function getHiddenGems(
  params: RecommendationParams
): Promise<RecommendationResult> {
  if (USE_MOCK_DATA) {
    console.log("📌 Using mock data for hidden gems");
    return getMockHiddenGems(params);
  }

  try {
    const { city, state, interests, perPage = 10, page = 1 } = params;

    const searchParams: SeatGeekEventSearchParams = {
      per_page: Math.max(perPage * 3, 50), // Fetch more to filter
      page,
      sort: "listing_count.desc", // Events with lots of tickets
    };

    if (city) searchParams.venue_city = city;
    if (state) searchParams.venue_state = state;
    if (interests && interests.length > 0) {
      searchParams.taxonomies_name = interests.join(",");
    }

    console.log("💎 Getting hidden gems with params:", searchParams);

    const result = await searchEvents(searchParams);

    // Filter for "hidden gems": decent score but not top-tier
    // Score between 0.2-0.65 indicates quality but not mainstream
    // Removed listing_count filter as SeatGeek API doesn't reliably provide this data
    const hiddenGems = result.events
      .filter(
        (event) =>
          event.score >= 0.2 &&
          event.score <= 0.65
      )
      .slice(0, perPage);

    return {
      events: hiddenGems,
      meta: {
        total: hiddenGems.length,
        page,
        perPage,
        source: "search",
      },
    };
  } catch (error) {
    console.error("Error getting hidden gems:", error);
    throw error;
  }
}

/**
 * Get mood-based recommendations
 * Maps mood parameters to taxonomies and price filters
 * Note: SeatGeek API doesn't support comma-separated taxonomies, so we query each separately
 */
export async function getMoodBasedEvents(
  mood: MoodParams,
  params: RecommendationParams
): Promise<RecommendationResult> {
  if (USE_MOCK_DATA) {
    console.log("📌 Using mock data for mood-based events");
    return getMockMoodBasedEvents(mood, params);
  }

  try {
    const { city, state, perPage = 12, page = 1 } = params;

    // Determine taxonomies based on mood
    let taxonomies: string[] = [];

    if (mood.energy === "high") {
      taxonomies = [...MOOD_TAXONOMY_MAP.highEnergy];
    } else if (mood.energy === "low") {
      taxonomies = [...MOOD_TAXONOMY_MAP.lowEnergy];
    }

    if (mood.social === "group") {
      if (taxonomies.length > 0) {
        taxonomies = taxonomies.filter((t) =>
          (MOOD_TAXONOMY_MAP.social as readonly string[]).includes(t)
        );
      } else {
        taxonomies = [...MOOD_TAXONOMY_MAP.social];
      }
    } else if (mood.social === "intimate") {
      if (taxonomies.length > 0) {
        taxonomies = taxonomies.filter((t) =>
          (MOOD_TAXONOMY_MAP.intimate as readonly string[]).includes(t)
        );
      } else {
        taxonomies = [...MOOD_TAXONOMY_MAP.intimate];
      }
    }

    // If no taxonomies matched, use a broad search
    if (taxonomies.length === 0) {
      taxonomies = [
        "concert",
        "sports",
        "theater",
        "comedy",
      ];
    }

    console.log("🎭 Getting mood-based events:", { mood, taxonomies });

    // SeatGeek API doesn't support comma-separated taxonomies
    // Query each taxonomy separately and combine results
    const eventsPerTaxonomy = Math.ceil((perPage * 2) / taxonomies.length);
    const allEvents: SeatGeekEvent[] = [];
    
    for (const taxonomy of taxonomies) {
      const searchParams: SeatGeekEventSearchParams = {
        taxonomies_name: taxonomy,
        per_page: eventsPerTaxonomy,
        page,
        sort: "score.desc",
      };

      if (city) searchParams.venue_city = city;
      if (state) searchParams.venue_state = state;

      console.log(`🔍 Searching ${taxonomy} events...`);
      
      try {
        const result = await searchEvents(searchParams);
        console.log(`📊 Found ${result.events?.length || 0} ${taxonomy} events`);
        allEvents.push(...(result.events || []));
      } catch (err) {
        console.error(`Error searching ${taxonomy}:`, err);
        // Continue with other taxonomies
      }
    }

    console.log(`📊 Total events found: ${allEvents.length}`);

    // Remove duplicates by event ID
    const uniqueEvents = Array.from(
      new Map(allEvents.map((e) => [e.id, e])).values()
    );

    // Sort by score descending
    uniqueEvents.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Apply budget filter
    let events = uniqueEvents;
    if (mood.budget !== "any") {
      const budgetRange = BUDGET_THRESHOLDS[mood.budget];
      events = filterEventsByPrice(events, budgetRange.min, budgetRange.max);
    }

    console.log(`📊 After budget filter: ${events.length} events`);

    return {
      events: events.slice(0, perPage),
      meta: {
        total: events.length,
        page,
        perPage,
        source: "search",
      },
    };
  } catch (error) {
    console.error("Error getting mood-based events:", error);
    throw error;
  }
}

/**
 * Resolve interest names to performer IDs for better recommendations
 */
export async function resolveInterestsToPerformers(
  interests: string[]
): Promise<number[]> {
  if (USE_MOCK_DATA || interests.length === 0) {
    return [];
  }

  try {
    const performerIds: number[] = [];

    // Search for top performers in each interest category
    for (const interest of interests.slice(0, 3)) {
      const result = await executeComposioAction(SEATGEEK_SEARCH_PERFORMERS, {
        q: interest,
        per_page: 3,
      });

      const data = parseComposioResult(result);
      const performers = (data.performers || []) as Array<{ id: number }>;
      performerIds.push(...performers.map((p) => p.id));
    }

    return performerIds.slice(0, 10); // Limit total performers
  } catch (error) {
    console.error("Error resolving interests to performers:", error);
    return [];
  }
}

// ==================== HELPER FUNCTIONS ====================

function parseComposioResult(result: unknown): Record<string, unknown> {
  if (!result) return {};

  if (typeof result === "object" && result !== null) {
    const obj = result as Record<string, unknown>;

    if ("data" in obj && typeof obj.data === "object") {
      return obj.data as Record<string, unknown>;
    }

    if ("response_data" in obj && typeof obj.response_data === "object") {
      return obj.response_data as Record<string, unknown>;
    }

    return obj;
  }

  if (typeof result === "string") {
    try {
      return JSON.parse(result);
    } catch {
      return {};
    }
  }

  return {};
}

async function getFallbackSimilarEvents(
  eventId: number,
  params: RecommendationParams
): Promise<RecommendationResult> {
  // This would require fetching the event first to get its taxonomy
  // For now, return empty result
  return {
    events: [],
    meta: {
      total: 0,
      page: params.page || 1,
      perPage: params.perPage || 6,
      source: "search",
    },
  };
}

// ==================== MOCK DATA ====================

function getMockPersonalizedRecommendations(
  params: RecommendationParams
): RecommendationResult {
  const mockEvents = generateMockEvents("personalized", params.interests);
  return {
    events: mockEvents.slice(0, params.perPage || 12),
    meta: {
      total: mockEvents.length,
      page: params.page || 1,
      perPage: params.perPage || 12,
      source: "mock",
    },
  };
}

function getMockTrendingEvents(params: RecommendationParams): RecommendationResult {
  const mockEvents = generateMockEvents("trending");
  return {
    events: mockEvents.slice(0, params.perPage || 10),
    meta: {
      total: mockEvents.length,
      page: params.page || 1,
      perPage: params.perPage || 10,
      source: "mock",
    },
  };
}

function getMockSimilarEvents(
  eventId: number,
  params: RecommendationParams
): RecommendationResult {
  const mockEvents = generateMockEvents("similar");
  return {
    events: mockEvents.slice(0, params.perPage || 6),
    meta: {
      total: mockEvents.length,
      page: params.page || 1,
      perPage: params.perPage || 6,
      source: "mock",
    },
  };
}

function getMockHiddenGems(params: RecommendationParams): RecommendationResult {
  const mockEvents = generateMockEvents("hidden-gems");
  return {
    events: mockEvents.slice(0, params.perPage || 10),
    meta: {
      total: mockEvents.length,
      page: params.page || 1,
      perPage: params.perPage || 10,
      source: "mock",
    },
  };
}

function getMockMoodBasedEvents(
  mood: MoodParams,
  params: RecommendationParams
): RecommendationResult {
  let taxonomyFilter: string[] = [];

  if (mood.energy === "high") {
    taxonomyFilter = MOOD_TAXONOMY_MAP.highEnergy as unknown as string[];
  } else if (mood.energy === "low") {
    taxonomyFilter = MOOD_TAXONOMY_MAP.lowEnergy as unknown as string[];
  }

  const mockEvents = generateMockEvents("mood", taxonomyFilter);
  
  // Filter by budget
  let filteredEvents = mockEvents;
  if (mood.budget !== "any") {
    const budgetRange = BUDGET_THRESHOLDS[mood.budget];
    filteredEvents = mockEvents.filter(
      (e) =>
        (e.stats?.lowest_price || 0) >= budgetRange.min &&
        (e.stats?.lowest_price || 0) <= budgetRange.max
    );
  }

  return {
    events: filteredEvents.slice(0, params.perPage || 12),
    meta: {
      total: filteredEvents.length,
      page: params.page || 1,
      perPage: params.perPage || 12,
      source: "mock",
    },
  };
}

function generateMockEvents(
  type: string,
  taxonomyFilter?: string[]
): SeatGeekEvent[] {
  const now = new Date();
  const baseEvents: SeatGeekEvent[] = [
    {
      id: 2001,
      title: "Coldplay | Music of the Spheres Tour",
      short_title: "Coldplay",
      datetime_local: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 10,
        name: "MetLife Stadium",
        city: "East Rutherford",
        state: "NJ",
        country: "US",
        location: { lat: 40.8128, lon: -74.0742 },
      },
      performers: [
        {
          id: 1001,
          name: "Coldplay",
          image: "https://chairnerd.global.ssl.fastly.net/images/performers-landscape/coldplay-e9c676/9/huge.jpg",
          primary: true,
          score: 0.92,
        },
      ],
      stats: {
        lowest_price: 150,
        highest_price: 750,
        average_price: 350,
        listing_count: 2500,
      },
      score: 0.92,
      url: "https://seatgeek.com/coldplay-tickets",
      type: "concert",
      taxonomies: [{ id: 1, name: "concert" }],
    },
    {
      id: 2002,
      title: "NBA Finals Game 7",
      short_title: "NBA Finals",
      datetime_local: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 11,
        name: "Chase Center",
        city: "San Francisco",
        state: "CA",
        country: "US",
        location: { lat: 37.768, lon: -122.3877 },
      },
      performers: [
        { id: 1002, name: "Golden State Warriors", primary: true },
        { id: 1003, name: "Boston Celtics" },
      ],
      stats: {
        lowest_price: 500,
        highest_price: 5000,
        listing_count: 1800,
      },
      score: 0.98,
      url: "https://seatgeek.com/nba-finals-tickets",
      type: "nba",
      taxonomies: [{ id: 2, name: "sports" }],
    },
    {
      id: 2003,
      title: "The Phantom of the Opera",
      short_title: "Phantom",
      datetime_local: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 12,
        name: "Majestic Theatre",
        city: "New York",
        state: "NY",
        country: "US",
        location: { lat: 40.7581, lon: -73.9876 },
      },
      performers: [
        { id: 1004, name: "Phantom of the Opera", primary: true },
      ],
      stats: {
        lowest_price: 79,
        highest_price: 350,
        listing_count: 400,
      },
      score: 0.65,
      url: "https://seatgeek.com/phantom-tickets",
      type: "broadway",
      taxonomies: [{ id: 3, name: "theater" }],
    },
    {
      id: 2004,
      title: "John Mulaney: Everybody's in L.A.",
      short_title: "John Mulaney",
      datetime_local: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 13,
        name: "The Forum",
        city: "Inglewood",
        state: "CA",
        country: "US",
        location: { lat: 33.9583, lon: -118.3419 },
      },
      performers: [
        { id: 1005, name: "John Mulaney", primary: true, score: 0.82 },
      ],
      stats: {
        lowest_price: 65,
        highest_price: 250,
        listing_count: 320,
      },
      score: 0.82,
      url: "https://seatgeek.com/john-mulaney-tickets",
      type: "comedy",
      taxonomies: [{ id: 4, name: "comedy" }],
    },
    {
      id: 2005,
      title: "Vienna Philharmonic Orchestra",
      short_title: "Vienna Philharmonic",
      datetime_local: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 14,
        name: "Carnegie Hall",
        city: "New York",
        state: "NY",
        country: "US",
        location: { lat: 40.765, lon: -73.9799 },
      },
      performers: [
        { id: 1006, name: "Vienna Philharmonic", primary: true },
      ],
      stats: {
        lowest_price: 85,
        highest_price: 400,
        listing_count: 180,
      },
      score: 0.55,
      url: "https://seatgeek.com/vienna-philharmonic-tickets",
      type: "classical_orchestral_instrumental",
      taxonomies: [{ id: 5, name: "classical" }],
    },
    {
      id: 2006,
      title: "EDC Las Vegas 2024",
      short_title: "EDC Vegas",
      datetime_local: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 15,
        name: "Las Vegas Motor Speedway",
        city: "Las Vegas",
        state: "NV",
        country: "US",
        location: { lat: 36.2722, lon: -115.0115 },
      },
      performers: [
        { id: 1007, name: "EDC Las Vegas", primary: true },
      ],
      stats: {
        lowest_price: 350,
        highest_price: 1500,
        listing_count: 890,
      },
      score: 0.89,
      url: "https://seatgeek.com/edc-tickets",
      type: "edm",
      taxonomies: [{ id: 1, name: "concert" }, { id: 7, name: "festival" }],
    },
    {
      id: 2007,
      title: "Blue Note Jazz Festival",
      short_title: "Blue Note Jazz",
      datetime_local: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 16,
        name: "Blue Note Jazz Club",
        city: "New York",
        state: "NY",
        country: "US",
        location: { lat: 40.7308, lon: -74.0005 },
      },
      performers: [
        { id: 1008, name: "Blue Note All-Stars", primary: true },
      ],
      stats: {
        lowest_price: 45,
        highest_price: 150,
        listing_count: 75,
      },
      score: 0.48,
      url: "https://seatgeek.com/blue-note-tickets",
      type: "jazz",
      taxonomies: [{ id: 1, name: "concert" }, { id: 8, name: "jazz" }],
    },
    {
      id: 2008,
      title: "Cirque du Soleil: KOOZA",
      short_title: "Cirque KOOZA",
      datetime_local: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      datetime_utc: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      venue: {
        id: 17,
        name: "Grand Chapiteau",
        city: "Atlanta",
        state: "GA",
        country: "US",
        location: { lat: 33.749, lon: -84.388 },
      },
      performers: [
        { id: 1009, name: "Cirque du Soleil", primary: true },
      ],
      stats: {
        lowest_price: 55,
        highest_price: 200,
        listing_count: 350,
      },
      score: 0.72,
      url: "https://seatgeek.com/cirque-tickets",
      type: "family",
      taxonomies: [{ id: 6, name: "family" }],
    },
  ];

  // Filter by taxonomy if specified
  let filtered = baseEvents;
  if (taxonomyFilter && taxonomyFilter.length > 0) {
    filtered = baseEvents.filter((e) =>
      e.taxonomies?.some((t) => taxonomyFilter.includes(t.name.toLowerCase()))
    );
  }

  // Sort based on type
  if (type === "trending") {
    filtered.sort((a, b) => b.score - a.score);
  } else if (type === "hidden-gems") {
    filtered = filtered.filter((e) => e.score >= 0.4 && e.score <= 0.75);
  }

  return filtered;
}

