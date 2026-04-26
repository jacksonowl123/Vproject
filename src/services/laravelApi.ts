import axios, { AxiosInstance } from 'axios';
import { svgPlaceholder } from '@/assets';

// Define a generic ApiResponse type
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error_type?: string;
}

// Type definitions from the original API
interface MemberDetails {
  iid: number;
  usr: string;
  email: string;
  people: number;
  status: number;
  datecreate?: {
    date: number;
    datestring: string;
    datelong: number;
  };
  permalink: string;
  wallet: {
    iid: number;
    value: number;
    bonus: number;
    account: unknown;
    accountType: string;
  };
  roles?: Array<{
    permissions: unknown;
    iid: number;
    guid: string;
    name: string;
  }>;
  merchant?: unknown;
  profile?: unknown;
  address?: unknown;
  principal?: unknown;
  // Legacy support for existing code
  account?: {
    cash: {
      currency: string;
      amount: string;
    };
    chips: {
      currency: string;
      amount: string;
    };
    bonus?: {
      currency: string;
      amount: string;
    };
  };
  banks?: Array<{
    bank: string;
    number: string;
    name: string;
  }>;
}

interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  mobile?: string;
}

interface LoginResponse {
  access_token?: string;
  message?: string;
}

interface CreateMemberPayload {
  usr: string;
  pwd: string;
  referral?: string; // length 6
}

interface BankAccountPayload {
  bank?: string;
  owner?: string;
  account?: string;
  bankid?: number | string;
  name?: string;
  accountnumber?: string;
}

interface LaunchGameResponse {
  message: string;
  rawdata: string;
  createuser: unknown;
  balance: {
    amount: string;
    reference: unknown;
  };
  interactive: unknown;
  authenticate: unknown;
  launch: unknown;
}

interface Game {
  id: number;
  name: string;
  category: string;
  image: string;
}

// Laravel API Configuration
const DEV_SERVER_PORTS = ['5173', '4173', '3000'];
const DEFAULT_LARAVEL_PORT = (import.meta as any).env?.VITE_LARAVEL_API_DEV_PORT || '8000';

function resolveLaravelBaseUrl(): string {
  const envBase = (import.meta as any).env?.VITE_LARAVEL_API_BASE_URL;
  if (envBase) {
    return envBase;
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;

    // When running via Vite dev server (5173, 4173, 3000), route API calls to Laravel port
    if (port && DEV_SERVER_PORTS.includes(port)) {
      return `${protocol}//${hostname}:${DEFAULT_LARAVEL_PORT}/api`;
    }

    // When frontend is already served by Laravel (same origin), relative /api works
    return '/api';
  }

  return '/api';
}

const LARAVEL_API_BASE_URL = resolveLaravelBaseUrl();

// Use current origin for Vite dev server (works for any port)
const VITE_DEV_SERVER_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5175';
const API_TIMEOUT = 30000; // 30 seconds

const BANK_ID_TO_CODE: Record<number, string> = {
  12: 'AFFIN_BANK',
  13: 'AGROBANK',
  14: 'ALLIANCE',
  15: 'AMBANK',
  16: 'ISLAM_BANK',
  17: 'RAKYAT_BANK',
  18: 'BSN',
  19: 'CIMB',
  20: 'CITIBANK',
  21: 'HLB',
  22: 'HSBC',
  23: 'MAYBANK',
  24: 'OCBC',
  25: 'PBE',
  26: 'RHB',
  27: 'SC_BANK',
  28: 'UOB',
  31: 'MUAMALAT_BANK',
};

function normalizeBankAccountPayload(data: BankAccountPayload) {
  const rawBank = data.bank ?? data.bankid;
  const numericBank = typeof rawBank === 'number' ? rawBank : Number(rawBank);

  return {
    bank: data.bank ?? (Number.isFinite(numericBank) ? BANK_ID_TO_CODE[numericBank] : String(rawBank || '')),
    owner: data.owner ?? data.name ?? '',
    account: data.account ?? data.accountnumber ?? ''
  };
}

function unwrapApiData(value: any): any {
  if (value?.data !== undefined && (value?.success !== undefined || value?.message !== undefined)) {
    return value.data;
  }

  return value;
}

function getValidStoredToken(action: string): string {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error(`Please log in again before ${action}`);
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload?.exp && payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem('token');
      throw new Error(`Your session has expired. Please log in again before ${action}`);
    }
  } catch (error: any) {
    if (error?.message?.includes('session has expired')) {
      throw error;
    }
  }

  return token;
}

// Create axios instance for Laravel backend
const laravelApiClient: AxiosInstance = axios.create({
  baseURL: LARAVEL_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Create axios instance for Vite dev server proxy routes
const viteProxyClient: AxiosInstance = axios.create({
  baseURL: VITE_DEV_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// Add request interceptor to add auth token to requests
laravelApiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
laravelApiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Laravel API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Add request interceptor to add auth token to Vite proxy requests
viteProxyClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for Vite proxy error handling
viteProxyClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Vite Proxy API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const laravelApi = {
  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing connection to Laravel backend...');
      const response = await laravelApiClient.get('/proxy/test');
      console.log('✅ Laravel connection test response:', response.data);
      return response.status === 200 && (response.data.success || response.data.message);
    } catch (error: any) {
      console.error('❌ Connection test failed:', error.response?.status, error.message);
      // Try a simpler endpoint if the main test fails
      try {
        console.log('🔄 Trying alternative connection test...');
        const simpleResponse = await laravelApiClient.get('/test');
        console.log('✅ Alternative connection test succeeded:', simpleResponse.data);
        return simpleResponse.status === 200;
      } catch (fallbackError: any) {
        console.error('❌ Alternative connection test also failed:', fallbackError.message);
        return false;
      }
    }
  },

  /**
   * Sign in member through Laravel backend
   */
  async signInMember(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await laravelApiClient.post('/proxy/signin', {
        usr: username,
        pwd: password
      });

      const result = response.data;
      
      if (result.success && result.data?.access_token) {
        // Store the token for future requests
        localStorage.setItem('token', result.data.access_token);
        console.log('✅ Successfully signed in through Laravel backend');
        return result.data;
      } else {
        throw new Error(result.message || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Sign in error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Authentication failed');
    }
  },

  /**
   * Create new member through Laravel backend
   */
  async createMember(details: CreateMemberPayload): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.post('/proxy/create-member', details);
      return response.data;
    } catch (error: any) {
      console.error('Create member error:', error.response?.data || error.message);
      
      // Try to extract user-friendly error message
      let errorMessage = 'Member creation failed';
      
      if (error.response?.data) {
        const apiError = error.response.data;
        
        // Check for nested error structure (errors.login)
        if (apiError.errors && apiError.errors.login) {
          errorMessage = 'This username is already taken. Please choose another one.';
        } 
        // Check for message field
        else if (apiError.message) {
          const msg = apiError.message.toLowerCase();
          
          // Extract clean message from nested JSON strings
          if (msg.includes('login already exist')) {
            errorMessage = 'This username is already taken. Please choose another one.';
          } else if (msg.includes('email already exist')) {
            errorMessage = 'This email is already registered. Please use a different email.';
          } else {
            // Try to parse JSON string if present
            try {
              const jsonMatch = apiError.message.match(/\{.*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.message && parsed.message.toLowerCase().includes('login already exist')) {
                  errorMessage = 'This username is already taken. Please choose another one.';
                } else {
                  errorMessage = parsed.message || apiError.message;
                }
              } else {
                errorMessage = apiError.message;
              }
            } catch {
              errorMessage = apiError.message;
            }
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get member details using the correct API format (members.whoami)
   */
  async getMemberDetails(): Promise<MemberDetails | null> {
    try {
      console.log('🔍 Fetching member details via Laravel proxy...');
      const response = await laravelApiClient.get('/proxy/member-details');
      const result = response.data;

      if (result?.success && result?.data) {
        const memberData = result.data as MemberDetails;

        if ((memberData as any).wallet) {
          (memberData as any).account = {
            cash: { currency: 'MYR', amount: Number((memberData as any).wallet?.value ?? 0).toFixed(2) },
            chips: { currency: 'MYR', amount: '0.00' },
            bonus: { currency: 'MYR', amount: Number((memberData as any).wallet?.bonus ?? 0).toFixed(2) },
          } as any;
        } else if (!(memberData as any).account) {
          (memberData as any).account = {
            cash: { currency: 'MYR', amount: '0.00' },
            chips: { currency: 'MYR', amount: '0.00' },
            bonus: { currency: 'MYR', amount: '0.00' },
          } as any;
        }
        return memberData;
      }
      throw new Error('Invalid member details response');
    } catch (error: any) {
      console.error('❌ Get member details error:', error.response?.data || error.message);
      // Final stub so UI can render
      const username = typeof window !== 'undefined' ? localStorage.getItem('username') || 'Member' : 'Member';
      const stub: MemberDetails = {
        iid: 0 as any,
        usr: username,
        email: '',
        people: 0 as any,
        status: 1,
        permalink: '',
        wallet: { iid: 0 as any, value: 0, bonus: 0, account: null as any, accountType: 'wallet' },
        account: { cash: { currency: 'MYR', amount: '0.00' }, chips: { currency: 'MYR', amount: '0.00' }, bonus: { currency: 'MYR', amount: '0.00' } } as any,
      } as any;
      return stub;
    }
  },

  /**
   * Update member profile through Laravel backend
   */
  async updateMemberProfile(updateData: ProfileUpdatePayload): Promise<MemberDetails> {
    try {
      const response = await laravelApiClient.put('/proxy/update-profile', updateData);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Update profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },

  /**
   * Update member password through Laravel backend
   */
  async updatePassword(newPassword: string): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.put('/proxy/update-password', {
        pwd: newPassword
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Password update failed');
      }
    } catch (error: any) {
      console.error('Update password error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Password update failed');
    }
  },

  /**
   * Manual deposit through Laravel backend
   */
  async depositManual(depositData: {
    amount: number | string;
    incentiveid: number;
    remarks: string;
  }): Promise<ApiResponse<any>> {
    try {
      console.log('🚀 Making manual deposit request through Laravel backend');
      
      const response = await laravelApiClient.post('/proxy/deposit-manual', {
        amount: typeof depositData.amount === 'string' ? parseFloat(depositData.amount) : depositData.amount,
        incentiveid: depositData.incentiveid,
        remarks: depositData.remarks
      });

      console.log('✅ Manual deposit response from Laravel:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Manual deposit error:', error.response?.data || error.message);
      
      // Handle specific server errors from Laravel
      if (error.response?.data?.error_type === 'server_error') {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.response?.data?.message || 'Manual deposit failed');
    }
  },

  /**
   * Gateway deposit through Laravel backend (new API)
   */
  async depositGateway(depositData: {
    amount: number | string;
    redirect?: string;
    gateway?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.post('/proxy/deposit-gateway', {
        amount: typeof depositData.amount === 'string' ? parseFloat(depositData.amount) : depositData.amount,
        redirect: depositData.redirect,
        gateway: depositData.gateway || 'pay2win'
      });

      return response.data;
    } catch (error: any) {
      console.error('Gateway deposit error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Gateway deposit failed');
    }
  },

  /**
   * Withdraw through Laravel backend
   */
  async withdraw(amount: number, bankid: number): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.post('/proxy/withdraw', {
        amount,
        bankid
      });

      return response.data;
    } catch (error: any) {
      console.error('Withdraw error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Withdrawal failed');
    }
  },

  /**
   * Get transactions through Laravel backend
   */
  async getTransactions(startDate?: string, endDate?: string, type?: string, status?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (type) params.append('type', type);
      if (status) params.append('status', status);

      const response = await laravelApiClient.get(`/proxy/transactions?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Get transactions error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get transactions');
    }
  },

  /**
   * Get platform balance through Laravel backend
   */
  async getPlatformBalance(platformid: number): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.post('/proxy/platform-balance', {
        platformid
      });

      if (response.data.success && response.data.data) {
        console.log('✅ Platform balance loaded:', response.data.data);
        return response.data;
      }

      return response.data;
    } catch (error: any) {
      console.error('Get platform balance error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get platform balance');
    }
  },

  /**
   * Transfer to platform through Laravel backend
   */
  async transferTo(amount: number, platformto: number): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.post('/proxy/transfer-to', {
        amount,
        platformto
      });

      return response.data;
    } catch (error: any) {
      console.error('Transfer to error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Transfer failed');
    }
  },

  /**
   * Transfer from platform through Laravel backend
   */
  async transferFrom(amount: number, platformfrom: number): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.post('/proxy/transfer-from', {
        amount,
        platformfrom
      });

      return response.data;
    } catch (error: any) {
      console.error('Transfer from error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Transfer failed');
    }
  },

  /**
   * Get system bank accounts through Laravel backend
   */
  async getSystemBankAccounts(): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.get('/proxy/system-banks');
      return response.data;
    } catch (error: any) {
      console.error('Get bank accounts error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get bank accounts');
    }
  },

  /**
   * Get current member bank accounts through Laravel backend
   */
  async getBankAccounts(): Promise<ApiResponse<any[]>> {
    try {
      getValidStoredToken('managing bank accounts');

      const response = await laravelApiClient.get('/proxy/banks');
      const data = unwrapApiData(response.data);
      return {
        success: true,
        data: Array.isArray(data) ? data : []
      };
    } catch (error: any) {
      console.error('Get bank accounts error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get bank accounts');
    }
  },

  /**
   * Create bank account through Laravel backend
   */
  async createBankAccount(data: BankAccountPayload): Promise<ApiResponse<any>> {
    try {
      getValidStoredToken('adding a bank account');

      const response = await laravelApiClient.post('/proxy/create-bank', normalizeBankAccountPayload(data));
      return response.data;
    } catch (error: any) {
      console.error('Create bank account error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Bank account creation failed');
    }
  },

  /**
   * Delete bank account through Laravel backend
   */
  async deleteBankAccount(bankId: number | string): Promise<ApiResponse<null>> {
    try {
      getValidStoredToken('deleting a bank account');

      const response = await laravelApiClient.post('/proxy/delete-bank', {
        bank_id: Number(bankId)
      });
      return response.data;
    } catch (error: any) {
      console.error('Delete bank account error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Bank account deletion failed');
    }
  },

  /**
   * Get incentives through Laravel backend
   */
  async getIncentives(): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.get('/proxy/incentives');
      
      if (response.data.success && response.data.data) {
        // The incentives API returns: { system: [...] }
        // Each incentive has decoded data already processed by Laravel
        console.log('✅ Incentives loaded:', response.data.data);
        return response.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Get incentives error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get incentives');
    }
  },

  /**
   * Launch game through Laravel backend
   */
  async launchGame(platformId: number): Promise<{ url: string | null }> {
    try {
      const response = await laravelApiClient.post('/proxy/launch-game', {
        platformid: platformId
      });

      if (response.data.success) {
        return response.data.data as { url: string | null };
      }
      throw new Error(response.data.message || 'Game launch failed');
    } catch (error: any) {
      console.error('Launch game error:', error.response?.data || error.message);
      
      // Handle specific external API errors
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage && errorMessage.includes('Method must be a non-empty string')) {
        throw new Error('🎮 Game service temporarily unavailable. The gaming platform is experiencing technical difficulties. Please try again later or contact support.');
      }
      
      if (errorMessage && errorMessage.includes('API request failed with status 500')) {
        throw new Error('🎮 Gaming platform error: The game servers are currently experiencing issues. Please try again in a few minutes.');
      }
      
      if (error.response?.status === 400 && errorMessage?.includes('<!DOCTYPE html>')) {
        throw new Error('🎮 Gaming platform maintenance: The gaming system is currently under maintenance. Please try again later.');
      }
      
      throw new Error(errorMessage || 'Game launch failed. Please try again or contact support.');
    }
  },

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  },

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    localStorage.removeItem('token');
  },

  /**
   * Get all platforms balance through Laravel backend
   */
  async getAllPlatformsBalance(): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.get('/proxy/platforms-balance');
      
      if (response.data.success && response.data.data) {
        console.log('✅ All platforms balance loaded:', response.data.data);
        return response.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Get all platforms balance error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get all platforms balance');
    }
  },

  // Additional utility methods for backward compatibility
  getGames(): Game[] {
    // Show only games supported by the new launch API (IDs = platformid)
    // Unavailable/App-only platforms are omitted
    // Using actual game images from public/assets/games/
    const basePath = '/assets/games/';
    
    const getGameImage = (category: string, index: number, gameName?: string): string => {
      // In Vite, files in public/ are served from root
      // Path should be /assets/games/filename.jpg
      // Using new images from Game-FN-2 folder
      let filename: string;
      
      // Game name to image filename mapping (from Game-FN-2 folder)
      const gameImageMap: Record<string, string> = {
        // Casino games
        'Allbet': 'AB.jpg',
        'ASIAGAMING': 'AG.jpg',
        'Big Gaming': 'BG.jpg',
        'Playtech': 'PT.jpg',
        'Sexy Baccarat': 'Sexy.jpg',
        'EBET': 'EBET.jpg',
        'Lion King': 'LK.jpg',
        'CMD': 'CMD.jpg',
        
        // Slots games
        'Microgaming': 'Microslot.jpg',
        'Pragmatic': 'PP.jpg',
        'Pussy888': 'pussy.jpg',
        'Joker': 'joker.jpg',
        'Mega888': 'mega.jpg',
        '918Kiss': '918.jpg',
        'Spade Gaming': 'SG.jpg',
        'JILI': 'Jili.jpg',
        
        // Sports games
        'M8 Sport': 'm8.jpg',
        'I1 Sport': 'L1.jpg',
        'WS Sport': 'ws.jpg',
        'BC Sport': 'BC.jpg',
        'IBC': 'IBC.jpg',
        'SBO': 'SBO.jpg',
      };
      
      // Check if we have a specific mapping for this game
      if (gameName && gameImageMap[gameName]) {
        filename = gameImageMap[gameName];
      } else {
        // Fallback to placeholder if no mapping found
        return svgPlaceholder(300, 200, '#111827', '#FFFFFF', gameName || category);
      }
      
      // Construct full path
      const imagePath = basePath + filename;
      
      // Debug logging with full details
      if (typeof window !== 'undefined') {
        const fullUrl = window.location.origin + imagePath;
        console.log(`[Game Image] ${gameName || category} (index ${index}):`, {
          filename,
          imagePath,
          fullUrl,
        });
        
        // Preload image to verify it exists
        const testImg = new Image();
        testImg.onload = () => {
          console.log(`✅ Image loaded successfully: ${fullUrl}`);
        };
        testImg.onerror = () => {
          console.error(`❌ Image failed to load: ${fullUrl}`);
        };
        testImg.src = fullUrl;
      }
      
      return imagePath;
    };
    
    // Track indices per category for proper image rotation
    let casinoIndex = 0;
    let slotsIndex = 0;
    let sportsIndex = 0;
    
    return [
      // Casino games
      { id: 1, name: 'Allbet', category: 'casino', image: getGameImage('casino', ++casinoIndex, 'Allbet') },
      { id: 2, name: 'ASIAGAMING', category: 'casino', image: getGameImage('casino', ++casinoIndex, 'ASIAGAMING') },
      { id: 4, name: 'Big Gaming', category: 'casino', image: getGameImage('casino', ++casinoIndex, 'Big Gaming') },
      { id: 6, name: 'Playtech', category: 'casino', image: getGameImage('casino', ++casinoIndex, 'Playtech') },
      { id: 11, name: 'Sexy Baccarat', category: 'casino', image: getGameImage('casino', ++casinoIndex, 'Sexy Baccarat') },
      { id: 20, name: 'Lion King', category: 'casino', image: getGameImage('casino', ++casinoIndex, 'Lion King') },
      
      // Slots games
      { id: 3, name: 'Microgaming', category: 'slots', image: getGameImage('slots', ++slotsIndex, 'Microgaming') },
      { id: 5, name: 'Pragmatic', category: 'slots', image: getGameImage('slots', ++slotsIndex, 'Pragmatic') },
      { id: 7, name: 'Pussy888', category: 'slots', image: getGameImage('slots', ++slotsIndex, 'Pussy888') },
      { id: 8, name: 'Joker', category: 'slots', image: getGameImage('slots', ++slotsIndex, 'Joker') },
      { id: 9, name: 'Mega888', category: 'slots', image: getGameImage('slots', ++slotsIndex, 'Mega888') },
      { id: 10, name: '918Kiss', category: 'slots', image: getGameImage('slots', ++slotsIndex, '918Kiss') },
      { id: 18, name: 'Spade Gaming', category: 'slots', image: getGameImage('slots', ++slotsIndex, 'Spade Gaming') },
      { id: 19, name: 'JILI', category: 'slots', image: getGameImage('slots', ++slotsIndex, 'JILI') },
      
      // Sports games
      { id: 13, name: 'M8 Sport', category: 'sports', image: getGameImage('sports', ++sportsIndex, 'M8 Sport') },
      { id: 14, name: 'I1 Sport', category: 'sports', image: getGameImage('sports', ++sportsIndex, 'I1 Sport') },
      { id: 15, name: 'WS Sport', category: 'sports', image: getGameImage('sports', ++sportsIndex, 'WS Sport') },
      { id: 16, name: 'BC Sport', category: 'sports', image: getGameImage('sports', ++sportsIndex, 'BC Sport') },
      { id: 21, name: 'IBC', category: 'sports', image: getGameImage('sports', ++sportsIndex, 'IBC') },
      { id: 22, name: 'SBO', category: 'sports', image: getGameImage('sports', ++sportsIndex, 'SBO') },
      { id: 12, name: 'EBET', category: 'sports', image: getGameImage('sports', ++sportsIndex, 'EBET') },
      { id: 55, name: 'CMD', category: 'sports', image: getGameImage('sports', ++sportsIndex, 'CMD') },
    ];
  },

  getGameById(id: number): Game | undefined {
    const games = this.getGames();
    return games.find(game => game.id === id);
  },

  /**
   * Get CMS content and promotions
   */
  async getCmsContent(): Promise<ApiResponse<any>> {
    try {
      const response = await laravelApiClient.get('/proxy/cms');
      
      if (response.data.success && response.data.data) {
        // Decode base64 content for each item
        const decodedData = response.data.data.map((item: any) => ({
          ...item,
          content: item.content ? atob(item.content) : ''
        }));
        
        return {
          ...response.data,
          data: decodedData
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Get CMS content error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get CMS content');
    }
  },

  /**
   * Claim a promotion (simulated for now - in real implementation this would be through deposits)
   * Note: According to API docs, promotions are claimed via deposits with incentive IDs
   */
  async claimPromotion(promotionId: number, amount?: number): Promise<ApiResponse<any>> {
    try {
      // In a real implementation, this would:
      // 1. Find the corresponding incentive ID for the promotion
      // 2. Make a deposit with that incentive ID
      // 3. The bonus would be automatically added to wallet.bonus
      
      // For now, simulate a successful claim
      console.log(`🎁 Simulating promotion claim for ID: ${promotionId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        data: {
          promotionId,
          bonusAmount: amount || 50,
          message: 'Promotion claimed successfully! Bonus added to your wallet.'
        }
      };
    } catch (error: any) {
      console.error('Claim promotion error:', error);
      throw new Error('Failed to claim promotion');
    }
  }
};

export default laravelApi; 
