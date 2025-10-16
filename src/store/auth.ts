import { reactive } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';

interface BankAccount {
  bank: string;
  number: string;
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

export const authState = reactive<AuthState>({
  isLoggedIn: false,
  username: '',
  memberDetails: null
});

export function setLoginState(isLoggedIn: boolean, username: string = '', token?: string) {
  console.log('Setting login state:', { isLoggedIn, username, hasToken: !!token });
  
  // Update localStorage
  if (isLoggedIn && token) {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    
    // Update axios authorization header in the API client
    if (api && api.setAuthToken) {
      api.setAuthToken(token);
    }
    
    // Fetch and store member details
    api.getMemberDetails().then(details => {
      if (details) {
        authState.memberDetails = details;
        console.log('✅ Updated member details after login:', details);
        
        if (details.account) {
          console.log('💰 Account balance info:');
          console.log('  - Cash:', details.account.cash);
          console.log('  - Chips:', details.account.chips);
        } else {
          console.warn('⚠️ No account balance data in member details');
        }
      } else {
        console.warn('⚠️ Member details were null after login');
      }
    }).catch(error => {
      console.error('❌ Error fetching member details after login:', error);
    });
  } else {
    // Clear all auth data on logout
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    // Clear token from API client
    if (api && api.clearAuthToken) {
      api.clearAuthToken();
    }
    
    authState.memberDetails = null;
  }

  // Update reactive state immediately
  authState.isLoggedIn = isLoggedIn;
  authState.username = username;
  
  console.log('New auth state:', authState);
}

export function checkLoginStatus(): boolean {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  
  console.log('Checking login status:', { hasToken: !!token, username });
  
  if (token) {
    authState.isLoggedIn = true;
    authState.username = username || '';
    
    // Fetch member details if logged in
    api.getMemberDetails().then(details => {
      authState.memberDetails = details;
      console.log('Updated member details:', details);
    }).catch(error => {
      console.error('Error fetching member details:', error);
    });
    
    return true;
  } else {
    authState.isLoggedIn = false;
    authState.username = '';
    authState.memberDetails = null;
    return false;
  }
}

export async function verifySession() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginState(false, '');
      return false;
    }
    
    // Call an API endpoint to verify token
    await api.getMemberDetails();
    return true;
  } catch (error) {
    setLoginState(false, '');
    return false;
  }
}

export function updateMemberDetails(details: MemberDetails) {
  authState.memberDetails = details;
} 