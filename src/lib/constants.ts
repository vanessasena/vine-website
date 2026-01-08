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

export const GENDER_OPTIONS = [
  'female',
  'male',
] as const;

export type GenderOption = typeof GENDER_OPTIONS[number];

export const SPIRITUAL_COURSE_OPTIONS = [
  'maturidade_no_espirito',
  'treinamento_de_lideres',
] as const;

export type SpiritualCourseOption = typeof SPIRITUAL_COURSE_OPTIONS[number];

export const CHURCH_ROLE_OPTIONS = [
  'discipulador',
  'lider',
  'lider_em_treinamento',
  'anfitriao',
  'anjo_da_guarda',
  'membro',
] as const;

export type ChurchRoleOption = typeof CHURCH_ROLE_OPTIONS[number];
