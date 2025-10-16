import laravelApi from '@/services/laravelApi';

export function launchGame(platformid) {
  return laravelApi.launchGame(Number(platformid));
}

export function getPlatformBalance(platformid) {
  return laravelApi.getPlatformBalance(Number(platformid));
}

export function getPlatformsBalance() {
  return laravelApi.getAllPlatformsBalance();
}