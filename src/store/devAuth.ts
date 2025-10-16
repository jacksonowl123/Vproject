import { reactive } from 'vue';

// Simplified dev member details for development (no mock balances)
const devMemberDetails = {
  usr: 'devuser',
  email: 'dev@example.com',
  name: 'Development User',
  mobile: '123-456-7890',
  status: 1,
  datecreate: {
    datestring: '2023-01-01'
  },
  account: {
    cash: {
      currency: 'MYR',
      amount: '0.00'
    },
    chips: {
      currency: 'MYR',
      amount: '0.00'
    }
  },
  banks: [
    {
      iid: 1001,
      bankid: 1,
      bank: 'Maybank',
      name: 'Development User',
      accountnumber: '1234567890'
    },
    {
      iid: 1002,
      bankid: 2,
      bank: 'CIMB Bank',
      name: 'Development User',
      accountnumber: '0987654321'
    }
  ]
};

interface BankAccount {
  iid?: number;
  bankid: number;
  bank: string;
  accountnumber: string;
  name: string;
}

interface Balance {
  currency: string;
  amount: string;
}

interface Account {
  cash: Balance;
  chips: Balance;
}

interface DateInfo {
  datestring: string;
}

interface MemberDetails {
  usr: string;
  email: string;
  name?: string;
  mobile?: string;
  status: number;
  datecreate?: DateInfo;
  account?: Account;
  banks?: BankAccount[];
}

interface AuthState {
  isLoggedIn: boolean;
  username: string;
  memberDetails: MemberDetails | null;
}

export const devAuthState = reactive<AuthState>({
  isLoggedIn: true,
  username: 'devuser',
  memberDetails: devMemberDetails
});

export function useDevLogin() {
  localStorage.setItem('dev_mode', 'true');
  localStorage.setItem('access_token', 'dev-token-123456');
  localStorage.setItem('username', 'devuser');
  
  console.log('Development login activated');
  return devAuthState;
}

export function checkDevMode(): boolean {
  return localStorage.getItem('dev_mode') === 'true';
}

export function enableDevMode(value: boolean = true): void {
  if (value) {
    localStorage.setItem('dev_mode', 'true');
    console.log('Development mode activated');
  } else {
    localStorage.removeItem('dev_mode');
    console.log('Development mode deactivated');
  }
}

export function isDevModeEnabled(): boolean {
  return localStorage.getItem('dev_mode') === 'true';
}

export function clearDevMode() {
  localStorage.removeItem('DEV_TOKEN');
  localStorage.removeItem('token');
  localStorage.removeItem('dev_mode');
  devAuthState.isLoggedIn = false;
  devAuthState.username = '';
  // Clear other related auth/dev data as needed
} 