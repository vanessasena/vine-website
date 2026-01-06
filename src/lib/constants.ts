/**
 * Shared constants for the Vine Church website
 */

export const VOLUNTEER_AREA_OPTIONS = [
  'worship',
  'vine_web',
  'kids',
  'store',
  'vine_media',
  'vine_clean',
  'cozinha',
  'vine_welcome',
  'vine_care',
] as const;

export type VolunteerArea = typeof VOLUNTEER_AREA_OPTIONS[number];
