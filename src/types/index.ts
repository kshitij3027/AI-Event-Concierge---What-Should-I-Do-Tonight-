// User location data
export interface UserLocation {
  lat: number;
  lng: number;
  city: string;
  state?: string;
  country?: string;
}

// Budget range
export interface BudgetRange {
  min: number;
  max: number;
}

// Group size options
export type GroupSize = 'solo' | 'couple' | 'small-group' | 'large-group';

// Interest categories
export type InterestCategory = 
  | 'concerts'
  | 'sports'
  | 'theater'
  | 'comedy'
  | 'jazz'
  | 'classical'
  | 'edm'
  | 'family'
  | 'festivals';

// User preferences stored in IndexedDB
export interface UserPreferences {
  id: string;
  location: UserLocation | null;
  interests: InterestCategory[];
  budgetRange: BudgetRange;
  groupSize: GroupSize;
  createdAt: Date;
  updatedAt: Date;
}

// User profile stored in IndexedDB
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Search history entry
export interface SearchHistoryEntry {
  id: string;
  query: string;
  filters: {
    date?: string;
    genre?: string;
    priceRange?: BudgetRange;
    location?: UserLocation;
  };
  timestamp: Date;
}

// Onboarding state for multi-step wizard
export interface OnboardingState {
  currentStep: number;
  location: UserLocation | null;
  interests: InterestCategory[];
  budgetRange: BudgetRange;
  groupSize: GroupSize | null;
}

// Interest category metadata for UI
export interface InterestOption {
  id: InterestCategory;
  label: string;
  icon: string;
  description: string;
}

// Budget preset options
export interface BudgetPreset {
  id: string;
  label: string;
  range: BudgetRange;
}

// Group size option metadata for UI
export interface GroupSizeOption {
  id: GroupSize;
  label: string;
  description: string;
  icon: string;
  minPeople: number;
  maxPeople: number;
}

