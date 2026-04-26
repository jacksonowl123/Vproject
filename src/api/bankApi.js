import laravelApi from '@/services/laravelApi';

export function createBankAccount(bankid, name, accountnumber) {
  return laravelApi.createBankAccount({ bankid: Number(bankid), name, accountnumber });
}

export function getSystemBankAccounts() {
  return laravelApi.getSystemBankAccounts();
}

export function getBankAccounts() {
  return laravelApi.getBankAccounts();
}

export function deleteBankAccount(bankId) {
  return laravelApi.deleteBankAccount(bankId);
}
