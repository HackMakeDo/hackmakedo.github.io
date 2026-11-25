import type { ImageMetadata } from 'astro';
import badge from '../assets/certifications/umbraco-certified-master.png';

/**
 * Warren's Umbraco certification: one place for the Credentials badge and stat, the timeline entry
 * and the Person JSON-LD (hasCredential). Certifications last two years: renew before `expires`,
 * then update the dates here (and the timeline entry's year if it changes).
 */
export const CERTIFICATION: {
  name: string;
  level: string;
  issued: string;
  expires: string;
  /** Warren's page on Umbraco's public list of certified developers: the proof. */
  profileUrl: string;
  badge: ImageMetadata;
} = {
  name: 'Umbraco Certified Master',
  level: 'Master',
  issued: '2026-11-25',
  expires: '2028-11-25',
  profileUrl: 'https://umbraco.com/training/certified-developers/developer/?uid=40013',
  badge,
};
