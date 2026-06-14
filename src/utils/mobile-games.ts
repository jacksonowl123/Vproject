import { PLATFORM_IDS } from '@/utils/reference-ids';

export interface MobileGameConfig {
  platformId: number;
  name: string;
  downloadUrl: string;
}

export const MOBILE_GAMES: Record<number, MobileGameConfig> = {
  [PLATFORM_IDS.MEGA888]: {
    platformId: PLATFORM_IDS.MEGA888,
    name: 'Mega888',
    downloadUrl: 'https://m.mega166.com'
  },
  [PLATFORM_IDS.PUSSY888]: {
    platformId: PLATFORM_IDS.PUSSY888,
    name: 'Pussy888',
    downloadUrl: 'https://mdl.pussy888.com'
  },
  [PLATFORM_IDS.KISS_918]: {
    platformId: PLATFORM_IDS.KISS_918,
    name: '918Kiss',
    downloadUrl: 'https://yop1.918kiss.com'
  },
  [PLATFORM_IDS.LION_KING]: {
    platformId: PLATFORM_IDS.LION_KING,
    name: 'Lion King',
    downloadUrl: 'https://dl.lk4u.xyz'
  }
};

export function isMobileGame(platformId: number): boolean {
  return Boolean(MOBILE_GAMES[platformId]);
}
