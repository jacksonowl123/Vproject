import laravelApi from '@/services/laravelApi';

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