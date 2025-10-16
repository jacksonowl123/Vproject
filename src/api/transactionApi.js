import laravelApi from '@/services/laravelApi';

// Check if we're in development mode
const isDev = import.meta.env?.DEV || false;

// Multiple potential gateway URLs to improve resilience
const GATEWAY_URLS = [
  isDev ? '/pg-proxy/pg' : 'http://pg.dewamalaya33.com/pg',  // Default URL
  'http://pg.dewamalaya33.com/pg',                           // Direct URL
  isDev ? '/pg-proxy' : 'http://pg.dewamalaya33.com',        // Root path
];

export function deposit(amount, incentiveid, remarks = '') {
  return laravelApi.depositManual({ amount, incentiveid, remarks });
}

export function withdraw(amount, bankid) {
  return laravelApi.withdraw(Number(amount), Number(bankid));
}

export function transferTo(amount, platformto) {
  return laravelApi.transferTo(Number(amount), Number(platformto));
}

export function transferFrom(amount, platformfrom) {
  return laravelApi.transferFrom(Number(amount), Number(platformfrom));
}