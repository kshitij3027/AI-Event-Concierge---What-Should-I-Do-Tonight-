import type {
  EventSearchParams,
  EventSearchResponse,
  EventDetailResponse,
  TaxonomiesResponse,
  RecommendationParams,
  RecommendationResponse,
  MoodParams,
} from '../types/events';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
}

/**
 * Search for events with filters
 */
export async function searchEvents(params: EventSearchParams = {}): Promise<EventSearchResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.q) queryParams.set('q', params.q);
  if (params.city) queryParams.set('city', params.city);
  if (params.state) queryParams.set('state', params.state);
  if (params.date_from) queryParams.set('date_from', params.date_from);
  if (params.date_to) queryParams.set('date_to', params.date_to);
  if (params.taxonomy) queryParams.set('taxonomy', params.taxonomy);
  if (params.per_page) queryParams.set('per_page', params.per_page.toString());
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.sort) queryParams.set('sort', params.sort);
  if (params.min_price !== undefined) queryParams.set('min_price', params.min_price.toString());
  if (params.max_price !== undefined) queryParams.set('max_price', params.max_price.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/events${queryString ? `?${queryString}` : ''}`;
  
  return apiFetch<EventSearchResponse>(endpoint);
}

/**
 * Get event details by ID
 */
export async function getEventById(eventId: number): Promise<EventDetailResponse> {
  return apiFetch<EventDetailResponse>(`/api/events/${eventId}`);
}

/**
 * Get available taxonomies/categories
 */
export async function getTaxonomies(): Promise<TaxonomiesResponse> {
  return apiFetch<TaxonomiesResponse>('/api/taxonomies');
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string; composio_configured: boolean }> {
  return apiFetch('/api/health');
}

/**
 * Get personalized recommendations
 */
export async function getRecommendations(params: RecommendationParams = {}): Promise<RecommendationResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.lat !== undefined) queryParams.set('lat', params.lat.toString());
  if (params.lon !== undefined) queryParams.set('lon', params.lon.toString());
  if (params.city) queryParams.set('city', params.city);
  if (params.state) queryParams.set('state', params.state);
  if (params.interests && params.interests.length > 0) {
    queryParams.set('interests', params.interests.join(','));
  }
  if (params.perPage) queryParams.set('per_page', params.perPage.toString());
  if (params.page) queryParams.set('page', params.page.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/recommendations${queryString ? `?${queryString}` : ''}`;
  
  return apiFetch<RecommendationResponse>(endpoint);
}

/**
 * Get trending events
 */
export async function getTrendingEvents(params: RecommendationParams = {}): Promise<RecommendationResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.lat !== undefined) queryParams.set('lat', params.lat.toString());
  if (params.lon !== undefined) queryParams.set('lon', params.lon.toString());
  if (params.city) queryParams.set('city', params.city);
  if (params.state) queryParams.set('state', params.state);
  if (params.perPage) queryParams.set('per_page', params.perPage.toString());
  if (params.page) queryParams.set('page', params.page.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/recommendations/trending${queryString ? `?${queryString}` : ''}`;
  
  return apiFetch<RecommendationResponse>(endpoint);
}

/**
 * Get similar events to a specific event
 */
export async function getSimilarEvents(eventId: number, perPage: number = 6): Promise<RecommendationResponse> {
  const queryParams = new URLSearchParams();
  queryParams.set('per_page', perPage.toString());

  return apiFetch<RecommendationResponse>(`/api/recommendations/similar/${eventId}?${queryParams.toString()}`);
}

/**
 * Get hidden gem events
 */
export async function getHiddenGems(params: RecommendationParams = {}): Promise<RecommendationResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.lat !== undefined) queryParams.set('lat', params.lat.toString());
  if (params.lon !== undefined) queryParams.set('lon', params.lon.toString());
  if (params.city) queryParams.set('city', params.city);
  if (params.state) queryParams.set('state', params.state);
  if (params.interests && params.interests.length > 0) {
    queryParams.set('interests', params.interests.join(','));
  }
  if (params.perPage) queryParams.set('per_page', params.perPage.toString());
  if (params.page) queryParams.set('page', params.page.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/recommendations/hidden-gems${queryString ? `?${queryString}` : ''}`;
  
  return apiFetch<RecommendationResponse>(endpoint);
}

/**
 * Get mood-based event recommendations
 */
export async function getMoodBasedEvents(
  mood: MoodParams,
  params: RecommendationParams = {}
): Promise<RecommendationResponse> {
  const queryParams = new URLSearchParams();
  
  queryParams.set('energy', mood.energy);
  queryParams.set('social', mood.social);
  queryParams.set('budget', mood.budget);
  
  if (params.lat !== undefined) queryParams.set('lat', params.lat.toString());
  if (params.lon !== undefined) queryParams.set('lon', params.lon.toString());
  if (params.city) queryParams.set('city', params.city);
  if (params.state) queryParams.set('state', params.state);
  if (params.perPage) queryParams.set('per_page', params.perPage.toString());
  if (params.page) queryParams.set('page', params.page.toString());

  const queryString = queryParams.toString();
  const endpoint = `/api/recommendations/mood${queryString ? `?${queryString}` : ''}`;
  
  return apiFetch<RecommendationResponse>(endpoint);
}

