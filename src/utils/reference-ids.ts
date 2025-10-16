// Platform IDs
export const PLATFORM_IDS = {
  ASIA_GAMING: 39,
  ALLBET: 40,
  PRAGMATIC: 41,
  EBET: 42,
  KISS_918: 43,
  MEGA888: 44,
  JILI: 45,
  JOKER: 46,
  LION_KING: 47,
  SEXY_BACCARAT: 48,
  KING85: 49,
  PUSSY888: 50,
  SBO: 51,
  OBET33: 53,
  BIG_GAMING: 54,
  SPADE_GAMING: 55,
  GRAND_DRAGON: 56,
  IBC: 57,
  PLAYTECH: 58,
  MICROGAMING: 59
};

// Platform Names Mapping
export const PLATFORM_NAMES: Record<number, string> = {
  39: 'AsiaGaming',
  40: 'ALLBET',
  41: 'Pragmatic',
  42: 'EBET',
  43: '918Kiss',
  44: 'Mega888',
  45: 'JILI',
  46: 'Joker',
  47: 'LionKing',
  48: 'Sexy Baccarat',
  49: 'King85',
  50: 'Pussy888',
  51: 'SBO',
  53: 'OBET33',
  54: 'BigGaming',
  55: 'SpadeGaming',
  56: 'Grand Dragon',
  57: 'IBC',
  58: 'Playtech',
  59: 'Microgaming'
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