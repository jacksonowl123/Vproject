<template>
  <div>
    <member-center-2>
      <!-- Wallet Content -->
      <div class="p-4 max-w-6xl mx-auto">
        <!-- Header with back button -->
        <div class="flex items-center mb-6">
          <router-link to="/userProfile" class="mr-4 text-gray-600 hover:text-gray-800">
            <i class="fas fa-arrow-left"></i>
          </router-link>
          <h2 class="text-2xl font-bold">Wallet</h2>
        </div>

        <!-- Balance Error Display -->
        <div v-if="balanceError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            <span>{{ balanceError }}</span>
            <button @click="refreshBalance" class="ml-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
              <i class="fas fa-retry mr-1"></i> Retry
            </button>
          </div>
        </div>

        <!-- Balance Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-5 rounded-lg shadow-md text-white relative overflow-hidden">
            <div class="absolute right-0 top-0 opacity-10">
              <i class="fas fa-wallet text-9xl transform translate-x-4 -translate-y-4"></i>
            </div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">Main Balance</h3>
              <button @click="toggleBalanceVisibility" class="text-white cursor-pointer z-10 relative p-2 text-xl" aria-label="Toggle balance visibility">
                <i :class="isBalanceHidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </button>
            </div>
            <p class="text-3xl font-bold mb-1">
              {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} 
              {{ isBalanceHidden ? '******' : (authState.memberDetails?.account?.cash?.amount || '0.00') }}
            </p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-sm opacity-80">Last updated: {{ formatDate(new Date()) }}</span>
              <button @click="refreshBalance" class="text-white hover:text-blue-200 transition-colors" aria-label="Refresh balance">
                <i class="fas fa-sync-alt" :class="{'animate-spin': isProcessing}"></i>
              </button>
            </div>
          </div>

          <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-5 rounded-lg shadow-md text-white relative overflow-hidden">
            <div class="absolute right-0 top-0 opacity-10">
              <i class="fas fa-coins text-9xl transform translate-x-4 -translate-y-4"></i>
            </div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">Game Chips</h3>
              <button @click="toggleBalanceVisibility" class="text-white cursor-pointer z-10 relative p-2 text-xl" aria-label="Toggle balance visibility">
                <i :class="isBalanceHidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </button>
            </div>
            <p class="text-3xl font-bold mb-1">
              {{ authState.memberDetails?.account?.chips?.currency || 'MYR' }} 
              {{ isBalanceHidden ? '******' : (authState.memberDetails?.account?.chips?.amount || '0.00') }}
            </p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-sm opacity-80">Last updated: {{ formatDate(new Date()) }}</span>
              <button @click="refreshBalance" class="text-white hover:text-purple-200 transition-colors" aria-label="Refresh balance">
                <i class="fas fa-sync-alt" :class="{'animate-spin': isProcessing}"></i>
              </button>
            </div>
          </div>

          <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-5 rounded-lg shadow-md text-white relative overflow-hidden">
            <div class="absolute right-0 top-0 opacity-10">
              <i class="fas fa-gift text-9xl transform translate-x-4 -translate-y-4"></i>
            </div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">Bonus Balance</h3>
              <button @click="toggleBalanceVisibility" class="text-white cursor-pointer z-10 relative p-2 text-xl" aria-label="Toggle balance visibility">
                <i :class="isBalanceHidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </button>
            </div>
            <p class="text-3xl font-bold mb-1">
              {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} 
              {{ isBalanceHidden ? '******' : (authState.memberDetails?.account?.bonus?.amount || '0.00') }}
            </p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-sm opacity-80">From promotions & bonuses</span>
              <button @click="refreshBalance" class="text-white hover:text-orange-200 transition-colors" aria-label="Refresh balance">
                <i class="fas fa-sync-alt" :class="{'animate-spin': isProcessing}"></i>
              </button>
            </div>
          </div>

          <div class="bg-gradient-to-r from-green-500 to-green-600 p-5 rounded-lg shadow-md text-white relative overflow-hidden">
            <div class="absolute right-0 top-0 opacity-10">
              <i class="fas fa-chart-line text-9xl transform translate-x-4 -translate-y-4"></i>
            </div>
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">Total Assets</h3>
              <button @click="toggleBalanceVisibility" class="text-white cursor-pointer z-10 relative p-2 text-xl" aria-label="Toggle balance visibility">
                <i :class="isBalanceHidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
              </button>
            </div>
            <p class="text-3xl font-bold mb-1">
              {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} 
              {{ isBalanceHidden ? '******' : totalBalance }}
            </p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-sm opacity-80">Last updated: {{ formatDate(new Date()) }}</span>
              <button @click="refreshBalance" class="text-white hover:text-green-200 transition-colors" aria-label="Refresh balance">
                <i class="fas fa-sync-alt" :class="{'animate-spin': isProcessing}"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 class="text-xl font-semibold mb-6">Quick Actions</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <router-link to="/deposit" class="flex flex-col items-center bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors">
              <div class="bg-blue-100 p-3 rounded-full mb-3">
                <i class="fas fa-plus text-blue-500 text-lg"></i>
              </div>
              <span class="font-medium text-gray-700">Deposit</span>
            </router-link>
            
            <router-link to="/withdraw" class="flex flex-col items-center bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors">
              <div class="bg-red-100 p-3 rounded-full mb-3">
                <i class="fas fa-minus text-red-500 text-lg"></i>
              </div>
              <span class="font-medium text-gray-700">Withdraw</span>
            </router-link>
            
            <button @click="showTransferDialog = true" class="flex flex-col items-center bg-purple-50 p-4 rounded-lg hover:bg-purple-100 transition-colors">
              <div class="bg-purple-100 p-3 rounded-full mb-3">
                <i class="fas fa-exchange-alt text-purple-500 text-lg"></i>
              </div>
              <span class="font-medium text-gray-700">Transfer</span>
            </button>
            
            <router-link to="/wallet/banks" class="flex flex-col items-center bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors">
              <div class="bg-green-100 p-3 rounded-full mb-3">
                <i class="fas fa-university text-green-500 text-lg"></i>
              </div>
              <span class="font-medium text-gray-700">Bank Accounts</span>
            </router-link>
          </div>
        </div>

        <!-- Recent Transactions Section Hidden -->

        <!-- Game Platforms -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold">Game Platforms</h3>
            <button class="text-blue-500 hover:text-blue-700 font-medium" @click="refreshGameBalances">
              Refresh <i class="fas fa-sync-alt ml-1"></i>
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="platform in gamePlatforms" :key="platform.id" class="border rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <img :src="platform.logo" :alt="platform.name" class="w-8 h-8 mr-2" @error="handleImageError">
                  <h4 class="font-medium">{{ platform.name }}</h4>
                </div>
                <span :class="[
                  'px-2 py-1 text-xs rounded-full',
                  platform.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ platform.status.charAt(0).toUpperCase() + platform.status.slice(1) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center mb-3">
                <span class="text-gray-600">Balance:</span>
                <span class="font-medium">{{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} {{ isBalanceHidden ? '******' : platform.balance }}</span>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  @click="openTransferModal(platform.id, 'to')" 
                  class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors"
                >
                  <i class="fas fa-arrow-right mr-1"></i> Transfer In
                </button>
                <button 
                  @click="openTransferModal(platform.id, 'from')" 
                  class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-3 rounded transition-colors"
                >
                  <i class="fas fa-arrow-left mr-1"></i> Transfer Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </member-center-2>

    <!-- Transfer Modal (Outside of member-center-2 because it's a modal) -->
    <div v-if="showTransferDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Transfer Funds</h3>
            <button @click="showTransferDialog = false" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Transfer Direction</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="transferDirection = 'to'"
                :class="[
                  'py-2 px-3 border rounded text-center',
                  transferDirection === 'to' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700'
                ]"
              >
                <i class="fas fa-wallet mr-1"></i> Wallet to Game
              </button>
              <button 
                @click="transferDirection = 'from'"
                :class="[
                  'py-2 px-3 border rounded text-center',
                  transferDirection === 'from' 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700'
                ]"
              >
                <i class="fas fa-gamepad mr-1"></i> Game to Wallet
              </button>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Game Platform</label>
            <select v-model="selectedPlatform" class="w-full p-3 border rounded">
              <option v-for="platform in gamePlatforms" :key="platform.id" :value="platform.id">
                {{ platform.name }}
              </option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }}
              </span>
              <input 
                type="number" 
                v-model="transferAmount" 
                class="w-full p-3 pl-12 border rounded" 
                placeholder="Enter amount"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">Min: {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} 10.00</p>
          </div>
          
          <button 
            @click="processTransfer" 
            :disabled="!isTransferValid || isProcessing"
            :class="[
              'w-full p-3 rounded font-medium',
              isTransferValid && !isProcessing
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <span v-if="isProcessing">
              <i class="fas fa-spinner fa-spin mr-2"></i> Processing...
            </span>
            <span v-else>
              {{ transferDirection === 'to' ? 'Transfer to Game' : 'Transfer to Wallet' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { authState } from '../store/auth';
import Swal from 'sweetalert2';
import { laravelApi as api } from '../services/laravelApi';
import { useRoute } from 'vue-router';
import { getPlatformName } from '../utils/reference-ids';
import MemberCenter2 from './MemberCenter2.vue';

interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'game';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  details?: {
    method?: string;
    bank?: string;
    accountNumber?: string;
    platform?: string;
  };
}

interface GamePlatform {
  id: string;
  name: string;
  logo: string;
  status: 'online' | 'offline';
  balance: number;
}

export default defineComponent({
  name: 'WalletPage',
  components: {
    MemberCenter2
  },
  setup() {
    const isBalanceHidden = ref(localStorage.getItem('balance_hidden') === 'true');
    const showTransferDialog = ref(false);
    const transferDirection = ref('to'); // 'to' = wallet to game, 'from' = game to wallet
    const selectedPlatform = ref('');
    const transferAmount = ref(0);
    const isProcessing = ref(false);
    const recentTransactions = ref<Transaction[]>([]);
    const transactionError = ref('');
    const balanceError = ref('');
    const platformBalancesData = ref<any[]>([]);
    
    // Check for URL parameters
    const route = useRoute();
    if (route.query.action === 'transfer') {
      showTransferDialog.value = true;
    }
    
    // Real game platforms data (will be populated from API)
    const gamePlatforms = ref<GamePlatform[]>([]);
    
    // Calculate total balance using real data only
    const totalBalance = computed(() => {
      const cashBalance = Number(authState.memberDetails?.account?.cash?.amount || 0);
      const chipsBalance = Number(authState.memberDetails?.account?.chips?.amount || 0);
      const bonusBalance = Number(authState.memberDetails?.account?.bonus?.amount || 0);
      
      // Use real platform balances from API
      const platformBalance = platformBalancesData.value.reduce((sum, platform) => {
        return sum + Number(platform.balance?.amount || 0);
      }, 0);
      
      return (cashBalance + chipsBalance + bonusBalance + platformBalance).toFixed(2);
    });

    // Load real platform balances from API
    const loadPlatformBalances = async () => {
      try {
        console.log('🔍 Loading real platform balances...');
        const response = await api.getAllPlatformsBalance();
        
        if (response.success && response.data && Array.isArray(response.data)) {
          platformBalancesData.value = response.data;
          
          // Update gamePlatforms with real data
          gamePlatforms.value = response.data.map((platform: any, index: number) => ({
            id: platform.platformid?.toString() || index.toString(),
            name: platform.platformname || getPlatformName(platform.platformid),
            logo: '/favicon.ico',
            status: 'online' as const,
            balance: Number(platform.balance?.amount || 0)
          }));
          
          console.log('✅ Platform balances loaded:', platformBalancesData.value);
        } else {
          console.warn('⚠️ Invalid platform balance data received');
          // Fallback to empty array to show 0 balances
          platformBalancesData.value = [];
          gamePlatforms.value = [];
        }
      } catch (error) {
        console.error('❌ Error loading platform balances:', error);
        // Fallback to empty array to show 0 balances
        platformBalancesData.value = [];
        gamePlatforms.value = [];
      }
    };

    // Enhanced balance refresh that loads all balance data
    const refreshBalance = async () => {
      try {
        isProcessing.value = true;
        balanceError.value = '';
        
        console.log('🔄 Refreshing all balance data...');
        
        // Fetch member details (cash and chips balance)
        const memberDetails = await api.getMemberDetails();
        if (memberDetails) {
          // Update local state with new details
          authState.memberDetails = memberDetails;
          
          if (memberDetails.account) {
            console.log('✅ Member details updated with account data:', memberDetails.account);
          } else {
            console.log('⚠️ Member details updated but no account data found');
            // Create default account structure if missing
            memberDetails.account = {
              cash: { currency: 'MYR', amount: '0.00' },
              chips: { currency: 'MYR', amount: '0.00' }
            };
            authState.memberDetails = memberDetails;
          }
        } else {
          throw new Error('No member details received from API');
        }
        
        // Also refresh platform balances
        await loadPlatformBalances();
        
        Swal.fire({
          icon: 'success',
          title: 'All Balances Updated',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } catch (error) {
        console.error('❌ Error refreshing balance:', error);
        balanceError.value = 'Failed to update balance. Please try again.';
        
        Swal.fire({
          icon: 'error',
          title: 'Failed to update balance',
          text: 'Please try again later.',
          confirmButtonColor: '#3B82F6'
        });
      } finally {
        isProcessing.value = false;
      }
    };

    // Load initial data
    onMounted(async () => {
      console.log('🚀 WalletPage mounting - loading initial data...');
      
      // Load balance data if user is logged in
      if (authState.isLoggedIn && authState.memberDetails) {
        await loadPlatformBalances();
      } else {
        console.log('⚠️ User not logged in or no member details available');
        balanceError.value = 'Please log in to view balance information';
      }
    });
    
    // Fetch real transaction data
    const fetchTransactions = async () => {
      try {
        isProcessing.value = true;
        transactionError.value = '';
        
        console.log('Fetching transactions...');
        
        // Fetch real transactions from API
        const data = await api.getTransactions();
        if (data && Array.isArray(data)) {
          recentTransactions.value = data.slice(0, 5);
          console.log('Transactions loaded:', data.length);
        } else {
          console.log('No transactions returned or invalid data format');
          transactionError.value = 'No transaction data available.';
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        transactionError.value = 'Failed to load transactions. Please try again later.';
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Toggle balance visibility
    const toggleBalanceVisibility = (event?: MouseEvent) => {
      // Prevent event propagation
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      isBalanceHidden.value = !isBalanceHidden.value;
      // Store the preference in localStorage
      localStorage.setItem('balance_hidden', isBalanceHidden.value ? 'true' : 'false');
      
      // Dispatch custom event to notify other components
      document.dispatchEvent(new CustomEvent('balance-visibility-changed', {
        detail: { isHidden: isBalanceHidden.value }
      }));
      
      // Apply immediately to this component
      console.log('Balance visibility toggled:', isBalanceHidden.value ? 'hidden' : 'visible');
    };
    
    // Refresh game platform balances
    const refreshGameBalances = async () => {
      try {
        isProcessing.value = true;
        
        // Load real platform balances instead of simulating
        await loadPlatformBalances();
        
        Swal.fire({
          icon: 'success',
          title: 'Game Balances Updated',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } catch (error) {
        console.error('Error refreshing game balances:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to update game balances',
          text: 'Please try again later.',
          confirmButtonColor: '#3B82F6'
        });
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Open transfer modal
    const openTransferModal = (platformId: string, direction: 'to' | 'from') => {
      console.log('🎯 Opening transfer modal:', { platformId, direction });
      selectedPlatform.value = platformId;
      transferDirection.value = direction;
      showTransferDialog.value = true;
    };
    
    // Check if transfer is valid
    const isTransferValid = computed(() => {
      if (transferAmount.value < 10) return false;
      if (!selectedPlatform.value) return false;
      
      return true;
    });
    
    // Process transfer
    const processTransfer = async () => {
      if (!isTransferValid.value) return;
      
      try {
        isProcessing.value = true;
        
        console.log('🚀 Starting transfer process:', {
          selectedPlatform: selectedPlatform.value,
          transferDirection: transferDirection.value,
          transferAmount: transferAmount.value
        });
        
        let response;
        const platformName = gamePlatforms.value.find(p => p.id === selectedPlatform.value)?.name || 'Unknown Platform';
        
        // Extract the actual platform ID from the selected platform
        const actualPlatformId = parseInt(selectedPlatform.value);
        
        console.log('🔍 Platform ID conversion:', {
          originalValue: selectedPlatform.value,
          convertedId: actualPlatformId,
          isValid: !isNaN(actualPlatformId)
        });
        
        // Validate that we have a valid platform ID
        if (isNaN(actualPlatformId)) {
          throw new Error(`Invalid platform ID selected: "${selectedPlatform.value}"`);
        }
        
        // Make actual API call based on transfer direction
        if (transferDirection.value === 'to') {
          console.log('🔄 Transfer To request:', {
            amount: transferAmount.value,
            platformto: actualPlatformId
          });
          
          response = await api.transferTo(transferAmount.value, actualPlatformId);
        } else {
          console.log('🔄 Transfer From request:', {
            amount: transferAmount.value,
            platformfrom: actualPlatformId
          });
          
          response = await api.transferFrom(transferAmount.value, actualPlatformId);
        }
        
        console.log('✅ Transfer response:', response);
        
        if (response.success && response.data?.status === 2) {
          Swal.fire({
            icon: 'success',
            title: 'Transfer Successful',
            text: `Successfully ${transferDirection.value === 'to' ? 'transferred to' : 'transferred from'} ${platformName}. Serial: ${response.data.serial || 'N/A'}`,
            confirmButtonColor: '#3B82F6'
          });
          
          // Refresh balances and transactions to get updated data
          await Promise.all([
            refreshBalance(),
            loadPlatformBalances(),
            fetchTransactions() // Fetch updated transactions from backend
          ]);
          
          // Reset form
          transferAmount.value = 0;
          showTransferDialog.value = false;
          
        } else {
          const statusMessage = response.data?.status 
            ? `Transfer status: ${response.data.status}` 
            : 'Transfer failed';
            
          Swal.fire({
            icon: 'warning',
            title: 'Transfer Issue',
            text: statusMessage,
            confirmButtonColor: '#3B82F6'
          });
        }
        
      } catch (error: any) {
        console.error('Transfer error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Transfer Failed',
          text: error.message || 'There was an issue processing your transfer. Please try again.',
          confirmButtonColor: '#3B82F6'
        });
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Format date
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Method to handle image loading errors
    const handleImageError = (e: Event) => {
      if (e.target && e.target instanceof HTMLImageElement) {
        // Replace with a data URI of a simple SVG placeholder
        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz4KPHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5OTk5Ij5JbWFnZTwvdGV4dD4KPC9zdmc+';
      }
    };

    return {
      authState,
      isBalanceHidden,
      toggleBalanceVisibility,
      formatDate,
      recentTransactions,
      transactionError,
      balanceError,
      platformBalancesData,
      gamePlatforms,
      totalBalance,
      refreshBalance,
      refreshGameBalances,
      loadPlatformBalances,
      isProcessing,
      showTransferDialog,
      transferDirection,
      selectedPlatform,
      transferAmount,
      openTransferModal,
      isTransferValid,
      processTransfer,
      fetchTransactions,
      handleImageError
    };
  }
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  text-align: left;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style> 