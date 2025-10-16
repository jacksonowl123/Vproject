import laravelApi from '@/services/laravelApi';

export async function signInMember(username, password) {
  // Delegate to Laravel backend
  const result = await laravelApi.signInMember(username, password);
  if (result?.access_token) {
    localStorage.setItem('token', result.access_token);
  }
  return result;
}

export async function createMember(firstname, lastname, phone, usr, pwd, email, status = '1') {
  // New register API only requires usr, pwd; optional referral should be provided elsewhere
  const res = await laravelApi.createMember({ usr, pwd });
  return res;
}

export async function getMemberDetails() {
  const res = await laravelApi.getMemberDetails();
  return res;
}

export async function updatePassword(newPassword) {
  const res = await laravelApi.updatePassword(newPassword);
  return res;
}
