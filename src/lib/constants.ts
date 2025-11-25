import type { InterestOption, BudgetPreset, GroupSizeOption, InterestCategory, GroupSize } from '../types';

export const INTEREST_OPTIONS: InterestOption[] = [
  {
    id: 'concerts',
    label: 'Concerts',
    icon: '🎸',
    description: 'Live music & performances',
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: '🏟️',
    description: 'Games & athletic events',
  },
  {
    id: 'theater',
    label: 'Theater',
    icon: '🎭',
    description: 'Broadway & stage shows',
  },
  {
    id: 'comedy',
    label: 'Comedy',
    icon: '😂',
    description: 'Stand-up & improv',
  },
  {
    id: 'jazz',
    label: 'Jazz',
    icon: '🎷',
    description: 'Jazz clubs & performances',
  },
  {
    id: 'classical',
    label: 'Classical',
    icon: '🎻',
    description: 'Orchestra & symphony',
  },
  {
    id: 'edm',
    label: 'EDM',
    icon: '🎧',
    description: 'Electronic & dance music',
  },
  {
    id: 'family',
    label: 'Family',
    icon: '👨‍👩‍👧‍👦',
    description: 'Kid-friendly events',
  },
  {
    id: 'festivals',
    label: 'Festivals',
    icon: '🎪',
    description: 'Multi-day celebrations',
  },
];

export const BUDGET_PRESETS: BudgetPreset[] = [
  {
    id: 'budget',
    label: 'Under $50',
    range: { min: 0, max: 50 },
  },
  {
    id: 'mid',
    label: '$50 - $150',
    range: { min: 50, max: 150 },
  },
  {
    id: 'premium',
    label: '$150 - $300',
    range: { min: 150, max: 300 },
  },
  {
    id: 'luxury',
    label: '$300+',
    range: { min: 300, max: 500 },
  },
];

export const GROUP_SIZE_OPTIONS: GroupSizeOption[] = [
  {
    id: 'solo',
    label: 'Solo',
    description: 'Just me, exploring on my own',
    icon: '👤',
    minPeople: 1,
    maxPeople: 1,
  },
  {
    id: 'couple',
    label: 'Date Night',
    description: 'Romantic evening for two',
    icon: '💑',
    minPeople: 2,
    maxPeople: 2,
  },
  {
    id: 'small-group',
    label: 'Friends',
    description: 'Small group of 3-5 people',
    icon: '👥',
    minPeople: 3,
    maxPeople: 5,
  },
  {
    id: 'large-group',
    label: 'Group',
    description: 'Larger party of 6+ people',
    icon: '👨‍👩‍👧‍👦',
    minPeople: 6,
    maxPeople: 20,
  },
];

export const ONBOARDING_STEPS = [
  { step: 1, label: 'Location', path: '/onboarding/step/1' },
  { step: 2, label: 'Interests', path: '/onboarding/step/2' },
  { step: 3, label: 'Budget', path: '/onboarding/step/3' },
  { step: 4, label: 'Group', path: '/onboarding/step/4' },
  { step: 5, label: 'Confirm', path: '/onboarding/step/5' },
];

export const getInterestOption = (id: InterestCategory): InterestOption | undefined => {
  return INTEREST_OPTIONS.find((option) => option.id === id);
};

export const getGroupSizeOption = (id: GroupSize): GroupSizeOption | undefined => {
  return GROUP_SIZE_OPTIONS.find((option) => option.id === id);
};

