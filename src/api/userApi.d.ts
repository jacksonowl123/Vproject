export function signInMember(username: string, password: string): Promise<any>;
export function createMember(
  firstname: string,
  lastname: string,
  phone: string,
  usr: string,
  pwd: string,
  email: string,
  status?: string
): Promise<any>;
export function getMemberDetails(): Promise<any>;
export function updatePassword(newPassword: string): Promise<any>; 