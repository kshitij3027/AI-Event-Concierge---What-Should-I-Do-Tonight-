import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { getDatabase } from '../lib/db';
import type {
  UserProfile,
  UserPreferences,
  UserLocation,
  InterestCategory,
  BudgetRange,
  GroupSize,
  OnboardingState,
} from '../types';

// ============================================
// State Types
// ============================================

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  onboarding: OnboardingState;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SET_PREFERENCES'; payload: UserPreferences }
  | { type: 'UPDATE_ONBOARDING'; payload: Partial<OnboardingState> }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'COMPLETE_ONBOARDING' };

// ============================================
// Initial State
// ============================================

const initialOnboardingState: OnboardingState = {
  currentStep: 1,
  location: null,
  interests: [],
  budgetRange: { min: 0, max: 200 },
  groupSize: null,
};

const initialState: UserState = {
  profile: null,
  preferences: null,
  onboarding: initialOnboardingState,
  isLoading: true,
  isInitialized: false,
  error: null,
};

// ============================================
// Reducer
// ============================================

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload, isLoading: false };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };
    case 'UPDATE_ONBOARDING':
      return {
        ...state,
        onboarding: { ...state.onboarding, ...action.payload },
      };
    case 'RESET_ONBOARDING':
      return { ...state, onboarding: initialOnboardingState };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        profile: state.profile
          ? { ...state.profile, isOnboarded: true }
          : null,
      };
    default:
      return state;
  }
}

// ============================================
// Context Types
// ============================================

interface UserContextValue {
  // State
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  onboarding: OnboardingState;
  isLoading: boolean;
  isOnboarded: boolean;
  error: string | null;

  // Onboarding actions
  setOnboardingStep: (step: number) => void;
  setLocation: (location: UserLocation | null) => void;
  setInterests: (interests: InterestCategory[]) => void;
  toggleInterest: (interest: InterestCategory) => void;
  setBudgetRange: (range: BudgetRange) => void;
  setGroupSize: (size: GroupSize) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;

  // Data operations
  refreshData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const UserContext = createContext<UserContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Initialize database and load user data
  useEffect(() => {
    const initializeUser = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const db = getDatabase();
        
        // Ensure default user exists
        const profile = await db.ensureDefaultUser();
        dispatch({ type: 'SET_PROFILE', payload: profile });

        // Load existing preferences if available
        const preferences = await db.getDefaultUserPreferences();
        if (preferences) {
          dispatch({ type: 'SET_PREFERENCES', payload: preferences });
          
          // Populate onboarding state from saved preferences
          dispatch({
            type: 'UPDATE_ONBOARDING',
            payload: {
              location: preferences.location,
              interests: preferences.interests,
              budgetRange: preferences.budgetRange,
              groupSize: preferences.groupSize,
            },
          });
        }

        dispatch({ type: 'SET_INITIALIZED', payload: true });
      } catch (error) {
        console.error('Failed to initialize user:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to initialize. Please refresh the page.',
        });
      }
    };

    initializeUser();
  }, []);

  // ============================================
  // Onboarding Actions
  // ============================================

  const setOnboardingStep = useCallback((step: number) => {
    dispatch({ type: 'UPDATE_ONBOARDING', payload: { currentStep: step } });
  }, []);

  const setLocation = useCallback((location: UserLocation | null) => {
    dispatch({ type: 'UPDATE_ONBOARDING', payload: { location } });
  }, []);

  const setInterests = useCallback((interests: InterestCategory[]) => {
    dispatch({ type: 'UPDATE_ONBOARDING', payload: { interests } });
  }, []);

  const toggleInterest = useCallback((interest: InterestCategory) => {
    dispatch({
      type: 'UPDATE_ONBOARDING',
      payload: {
        interests: state.onboarding.interests.includes(interest)
          ? state.onboarding.interests.filter((i) => i !== interest)
          : [...state.onboarding.interests, interest],
      },
    });
  }, [state.onboarding.interests]);

  const setBudgetRange = useCallback((budgetRange: BudgetRange) => {
    dispatch({ type: 'UPDATE_ONBOARDING', payload: { budgetRange } });
  }, []);

  const setGroupSize = useCallback((groupSize: GroupSize) => {
    dispatch({ type: 'UPDATE_ONBOARDING', payload: { groupSize } });
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const db = getDatabase();
      const { location, interests, budgetRange, groupSize } = state.onboarding;

      // Save preferences
      const preferences: UserPreferences = {
        id: 'default-user',
        location,
        interests,
        budgetRange,
        groupSize: groupSize || 'solo',
        createdAt: state.preferences?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await db.saveUserPreferences(preferences);
      dispatch({ type: 'SET_PREFERENCES', payload: preferences });

      // Update profile to mark as onboarded
      const profile: UserProfile = {
        id: 'default-user',
        isOnboarded: true,
        createdAt: state.profile?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await db.saveUserProfile(profile);
      dispatch({ type: 'SET_PROFILE', payload: profile });
      dispatch({ type: 'COMPLETE_ONBOARDING' });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to save preferences. Please try again.',
      });
    }
  }, [state.onboarding, state.preferences?.createdAt, state.profile?.createdAt]);

  const resetOnboarding = useCallback(() => {
    dispatch({ type: 'RESET_ONBOARDING' });
  }, []);

  // ============================================
  // Data Operations
  // ============================================

  const refreshData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const db = getDatabase();
      
      const profile = await db.getDefaultUserProfile();
      if (profile) {
        dispatch({ type: 'SET_PROFILE', payload: profile });
      }

      const preferences = await db.getDefaultUserPreferences();
      if (preferences) {
        dispatch({ type: 'SET_PREFERENCES', payload: preferences });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load data. Please try again.',
      });
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      const db = getDatabase();
      await db.clearAllData();
      
      dispatch({ type: 'RESET_ONBOARDING' });
      dispatch({ type: 'SET_PROFILE', payload: null as unknown as UserProfile });
      dispatch({ type: 'SET_PREFERENCES', payload: null as unknown as UserPreferences });
      
      // Re-initialize
      const profile = await db.ensureDefaultUser();
      dispatch({ type: 'SET_PROFILE', payload: profile });
    } catch (error) {
      console.error('Failed to clear data:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to clear data. Please try again.',
      });
    }
  }, []);

  // ============================================
  // Context Value
  // ============================================

  const value: UserContextValue = {
    profile: state.profile,
    preferences: state.preferences,
    onboarding: state.onboarding,
    isLoading: state.isLoading,
    isOnboarded: state.profile?.isOnboarded ?? false,
    error: state.error,

    setOnboardingStep,
    setLocation,
    setInterests,
    toggleInterest,
    setBudgetRange,
    setGroupSize,
    completeOnboarding,
    resetOnboarding,

    refreshData,
    clearAllData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ============================================
// Hook
// ============================================

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;

