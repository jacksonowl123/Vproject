import laravelApi from '@/services/laravelApi';

export function getIncentives() {
  return laravelApi.getIncentives();
}

export function getPromotions() {
  return laravelApi.getCmsContent();
}