import type { InterestCategory } from '../types';

/**
 * Maps user interest categories to SeatGeek taxonomy names
 */
export const INTEREST_TO_TAXONOMY: Record<InterestCategory, string> = {
  concerts: 'concert',
  sports: 'sports',
  theater: 'theater',
  comedy: 'comedy',
  jazz: 'concert', // Jazz falls under concert
  classical: 'classical',
  edm: 'concert', // EDM falls under concert
  family: 'family',
  festivals: 'festival',
};

/**
 * Maps SeatGeek taxonomy names back to user interest categories
 */
export const TAXONOMY_TO_INTEREST: Record<string, InterestCategory> = {
  concert: 'concerts',
  sports: 'sports',
  theater: 'theater',
  comedy: 'comedy',
  classical: 'classical',
  family: 'family',
  festival: 'festivals',
};

/**
 * Display labels for taxonomies
 */
export const TAXONOMY_LABELS: Record<string, string> = {
  concert: '🎸 Concerts',
  sports: '🏟️ Sports',
  theater: '🎭 Theater',
  comedy: '😂 Comedy',
  classical: '🎻 Classical',
  family: '👨‍👩‍👧‍👦 Family',
  festival: '🎪 Festivals',
  music_festival: '🎶 Music Festivals',
  broadway: '🎭 Broadway',
  nba: '🏀 NBA',
  nfl: '🏈 NFL',
  mlb: '⚾ MLB',
  nhl: '🏒 NHL',
  mls: '⚽ MLS',
  ncaa_football: '🏈 College Football',
  ncaa_basketball: '🏀 College Basketball',
};

/**
 * Get taxonomy name for a single interest
 */
export function interestToTaxonomy(interest: InterestCategory): string {
  return INTEREST_TO_TAXONOMY[interest];
}

/**
 * Convert multiple interests to taxonomy query string
 * SeatGeek accepts comma-separated taxonomy names
 */
export function interestsToTaxonomyQuery(interests: InterestCategory[]): string {
  if (!interests.length) return '';
  
  // Get unique taxonomies (jazz, edm both map to concert)
  const taxonomies = [...new Set(interests.map(interestToTaxonomy))];
  return taxonomies.join(',');
}

/**
 * Get display label for a taxonomy
 */
export function getTaxonomyLabel(taxonomy: string): string {
  return TAXONOMY_LABELS[taxonomy.toLowerCase()] || 
    taxonomy.charAt(0).toUpperCase() + taxonomy.slice(1);
}

/**
 * Get icon for a taxonomy
 */
export function getTaxonomyIcon(taxonomy: string): string {
  const icons: Record<string, string> = {
    concert: '🎸',
    sports: '🏟️',
    theater: '🎭',
    comedy: '😂',
    classical: '🎻',
    family: '👨‍👩‍👧‍👦',
    festival: '🎪',
    nba: '🏀',
    nfl: '🏈',
    mlb: '⚾',
    nhl: '🏒',
    mls: '⚽',
  };
  
  return icons[taxonomy.toLowerCase()] || '🎫';
}

/**
 * Available filter taxonomies for the discovery page
 */
export const FILTER_TAXONOMIES = [
  { id: '', label: 'All Events', icon: '🎫' },
  { id: 'concert', label: 'Concerts', icon: '🎸' },
  { id: 'sports', label: 'Sports', icon: '🏟️' },
  { id: 'theater', label: 'Theater', icon: '🎭' },
  { id: 'comedy', label: 'Comedy', icon: '😂' },
  { id: 'classical', label: 'Classical', icon: '🎻' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'festival', label: 'Festivals', icon: '🎪' },
];

/**
 * Date filter options for the discovery page
 */
export const DATE_FILTER_OPTIONS = [
  { id: 'tonight', label: 'Tonight', icon: '🌙' },
  { id: 'tomorrow', label: 'Tomorrow', icon: '☀️' },
  { id: 'weekend', label: 'This Weekend', icon: '📅' },
  { id: 'week', label: 'This Week', icon: '🗓️' },
  { id: 'month', label: 'This Month', icon: '📆' },
];

