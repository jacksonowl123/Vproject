import laravelApi from '@/services/laravelApi';

export function createBankAccount(bankid, name, accountnumber) {
  return laravelApi.createBankAccount({ bankid: Number(bankid), name, accountnumber });
}

export function getSystemBankAccounts() {
  return laravelApi.getSystemBankAccounts();
}