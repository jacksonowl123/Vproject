// Platform IDs
export const PLATFORM_IDS = {
  ALLBET: 1,
  ASIA_GAMING: 2,
  MICROGAMING: 3,
  BIG_GAMING: 4,
  PRAGMATIC: 5,
  PLAYTECH: 6,
  PUSSY888: 7,
  JOKER: 8,
  MEGA888: 9,
  KISS_918: 10,
  SEXY_BACCARAT: 11,
  EBET: 12,
  M8_SPORT: 13,
  I1_SPORT: 14,
  WS_SPORT: 15,
  BC_SPORT: 16,
  IBC: 17,
  SBO: 18,
  CMD: 19,
  LION_KING: 20,
  SPADE_GAMING: 21,
  JILI: 22
};

// Platform Names Mapping
export const PLATFORM_NAMES: Record<number, string> = {
  1: 'Allbet',
  2: 'Asia Gaming',
  3: 'Microgaming',
  4: 'Big Gaming',
  5: 'Pragmatic',
  6: 'Playtech',
  7: 'Pussy888',
  8: 'Joker',
  9: 'Mega888',
  10: '918Kiss',
  11: 'Sexy Baccarat',
  12: 'EBet',
  13: 'M8 Sport',
  14: 'I1 Sport',
  15: 'WS Sport',
  16: 'BC Sport',
  17: 'IBC Sport',
  18: 'SBO',
  19: 'CMD',
  20: 'Lion King',
  21: 'Spade Gaming',
  22: 'JILI'
};

// Helper function to get platform name by ID
export const getPlatformName = (platformId: number | string): string => {
  const id = typeof platformId === 'string' ? parseInt(platformId) : platformId;
  return PLATFORM_NAMES[id] || `Platform ${id}`;
};

// Game IDs
export const GAME_IDS = {
  ASIA_GAMING: 101,
  ALLBET: 102,
  PRAGMATIC: 103,
  EBET: 104,
  KISS_918: 105,
  MEGA888: 106,
  JILI: 107,
  JOKER: 108,
  LION_KING: 109,
  SEXY_BACCARAT: 110,
  KING85: 111,
  PUSSY888: 112,
  SBO: 113,
  OBET33: 114,
  BIG_GAMING: 115,
  SPADE_GAMING: 116,
  GRAND_DRAGON_LOTTO: 117,
  IBC: 118,
  PLAYTECH: 119,
  MICROGAMING: 120
};

// Bank IDs
export const BANK_IDS = {
  AFFIN_BANK: 12,
  AGRO_BANK: 13,
  ALLIANCE_BANK: 14,
  AMBANK: 15,
  BANK_ISLAM: 16,
  BANK_RAKYAT: 17,
  BSN: 18,
  CIMB: 19,
  CITIBANK: 20,
  HONG_LEONG_BANK: 21,
  HSBC_BANK: 22,
  MAYBANK: 23,
  OCBC: 24,
  PUBLIC_BANK: 25,
  RHB_BANK: 26,
  STANDARD_CHARTERED_BANK: 27,
  UOB: 28,
  BANK_MUAMALAT: 31,
  // Special bank ID for deposit
  DEPOSIT_BANK_ID: 221
};

// FTP Information
export const FTP_INFO = {
  HOST: 'ftp.dewamalaya33.com',
  PORT: 1023,
  LOGIN: 'dewamalaya33',
  PASSWORD: 'dewamalaya33',
  TRANSFER_MODE: 'Passive',
  WEBSITE: 'www.dewamalaya33.com'
};

// Commonly used incentive IDs
export const INCENTIVE_IDS = {
  WELCOME_BONUS: 55
};
