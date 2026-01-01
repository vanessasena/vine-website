/**
 * Shared constants for the Vine Church website
 */

export const VOLUNTEER_AREA_OPTIONS = [
  'louvor',
  'tecnologia',
  'recepcao',
  'kids',
  'store',
  'teens',
  'midia',
  'limpeza',
  'cozinha',
  'eventos',
  'outros',
] as const;

export type VolunteerArea = typeof VOLUNTEER_AREA_OPTIONS[number];
