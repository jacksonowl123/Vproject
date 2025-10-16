<template>
  <div class="p-4">
    <div v-if="!authState.memberDetails">Loading...</div>
    <div v-else class="space-y-4">
      <h2 class="text-2xl font-bold mb-4">Profile Details</h2>
      
      <!-- User Info -->
      <div class="bg-white p-4 rounded-lg shadow-md">
        <!-- Profile Header -->
        <div class="flex items-center mb-4 border-b pb-3">
          <div class="bg-blue-100 p-3 rounded-full mr-3">
            <i class="fas fa-user text-blue-500"></i>
          </div>
          <div>
            <h3 class="font-semibold text-lg">{{ authState.memberDetails.usr }}</h3>
            <p class="text-sm text-gray-500">ID: {{ authState.memberDetails.iid || 'N/A' }}</p>
            <p class="text-sm text-gray-500">{{ authState.memberDetails.email || 'No email' }}</p>
          </div>
        </div>

        <!-- Account Status -->
        <div class="mb-4">
          <div class="flex justify-between mb-2">
            <span class="text-sm text-gray-600">Status:</span>
            <span class="text-sm font-medium" :class="Number(authState.memberDetails.status) === 1 ? 'text-green-600' : 'text-red-600'">
              {{ Number(authState.memberDetails.status) === 1 ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Member Since:</span>
            <span class="text-sm">{{ authState.memberDetails.datecreate?.datestring || 'N/A' }}</span>
          </div>
        </div>

        <!-- Balance Information (uses wallet when available) -->
        <div class="bg-gray-100 p-3 rounded-lg mb-4">
          <div class="flex justify-between mb-2">
            <span class="text-sm font-medium">Main Balance:</span>
            <span class="text-sm font-semibold">
              MYR {{ isBalanceHidden ? '******' : mainBalance }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm font-medium">Bonus Balance:</span>
            <span class="text-sm font-semibold">
              MYR {{ isBalanceHidden ? '******' : bonusBalance }}
            </span>
          </div>
          <button 
            @click="toggleBalanceVisibility" 
            class="w-full mt-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
          >
            <i :class="isBalanceHidden ? 'fas fa-eye mr-1' : 'fas fa-eye-slash mr-1'"></i>
            {{ isBalanceHidden ? 'Show Balance' : 'Hide Balance' }}
          </button>
        </div>
      </div>

      <!-- Add Account Settings button in the User Info section -->
      <div class="mb-6 bg-white rounded-lg shadow-md p-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">User Info</h2>
          <button 
            @click="showAccountSettings = true" 
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <i class="fas fa-cog mr-1"></i> Account Settings
          </button>
        </div>
        <!-- ... existing user info ... -->
      </div>

      <!-- Transaction Actions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Deposit Section -->
        <div class="bg-white p-4 rounded-lg shadow-md">
          <div class="flex items-center mb-4">
            <div class="bg-green-100 p-2 rounded-full mr-3">
              <i class="fas fa-money-bill-wave text-green-500"></i>
            </div>
            <h3 class="text-lg font-semibold">Deposit</h3>
          </div>
          <div class="space-y-2">
            <router-link 
              to="/member/deposit"
              class="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
            >
              <i class="fas fa-plus-circle mr-2"></i>New Deposit
            </router-link>
            
            <!-- Payment Method Options -->
            <div class="grid grid-cols-2 gap-2 mt-3">
              <router-link
                to="/member/deposit?method=bank"
                class="flex flex-col items-center p-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                <i class="fas fa-university mb-1"></i>
                <span class="text-xs">Bank Transfer</span>
              </router-link>
              <router-link
                to="/member/deposit?method=usdt"
                class="flex flex-col items-center p-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                <i class="fas fa-coins mb-1"></i>
                <span class="text-xs">USDT</span>
              </router-link>
            </div>
            
            <div class="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded">
              <div class="flex items-center mb-1">
                <i class="fas fa-info-circle mr-1 text-blue-500"></i>
                <p class="font-medium">Deposit Information</p>
              </div>
              <ul class="pl-5 text-xs space-y-1 list-disc">
                <li>Min deposit: MYR 50</li>
                <li>Processing time: 5-15 mins</li>
                <li>24/7 customer support available</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Withdraw Section -->
        <div class="bg-white p-4 rounded-lg shadow-md">
          <div class="flex items-center mb-4">
            <div class="bg-blue-100 p-2 rounded-full mr-3">
              <i class="fas fa-hand-holding-usd text-blue-500"></i>
            </div>
            <h3 class="text-lg font-semibold">Withdraw</h3>
          </div>
          <div class="space-y-2">
            <router-link 
              to="/withdraw"
              class="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-center"
            >
              <i class="fas fa-money-bill-wave mr-2"></i>Request Withdrawal
            </router-link>
            
            <!-- Withdrawal Method Options -->
            <div class="grid grid-cols-2 gap-2 mt-3">
              <router-link
                to="/withdraw?method=bank"
                class="flex flex-col items-center p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                <i class="fas fa-university mb-1"></i>
                <span class="text-xs">Bank Account</span>
              </router-link>
              <router-link
                to="/withdraw?method=usdt"
                class="flex flex-col items-center p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                <i class="fas fa-coins mb-1"></i>
                <span class="text-xs">USDT</span>
              </router-link>
            </div>
            
            <div class="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded">
              <div class="flex items-center mb-1">
                <i class="fas fa-info-circle mr-1 text-blue-500"></i>
                <p class="font-medium">Withdrawal Information</p>
              </div>
              <ul class="pl-5 text-xs space-y-1 list-disc">
                <li>Min withdrawal: MYR 50</li>
                <li>Processing time: 1-24 hours</li>
                <li>First withdrawal of day is fee-free</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Wallet Section -->
        <div class="bg-white p-4 rounded-lg shadow-md">
          <div class="flex items-center mb-4">
            <div class="bg-purple-100 p-2 rounded-full mr-3">
              <i class="fas fa-wallet text-purple-500"></i>
            </div>
            <h3 class="text-lg font-semibold">Wallet</h3>
          </div>
          <div class="space-y-2">
            <router-link 
              to="/wallet"
              class="block w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 text-center"
            >
              <i class="fas fa-chart-line mr-2"></i>Wallet Dashboard
            </router-link>
            
            <!-- Wallet Features Grid -->
            <div class="grid grid-cols-3 gap-2 mt-3">
              <router-link
                to="/deposit"
                class="flex flex-col items-center p-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                <i class="fas fa-plus-circle mb-1"></i>
                <span class="text-xs">Top Up</span>
              </router-link>
              <router-link
                to="/wallet?action=transfer"
                class="flex flex-col items-center p-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                <i class="fas fa-exchange-alt mb-1"></i>
                <span class="text-xs">Transfer</span>
              </router-link>
              <router-link
                to="/wallet/banks"
                class="flex flex-col items-center p-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                <i class="fas fa-university mb-1"></i>
                <span class="text-xs">Banks</span>
              </router-link>
            </div>
            
            <!-- Balance Summary -->
            <div class="mt-3 p-2 bg-gray-50 rounded">
              <div class="grid grid-cols-2 gap-2">
                <div class="text-center">
                  <p class="text-xs text-gray-500">Cash</p>
                  <p class="font-semibold text-purple-700">{{ isBalanceHidden ? '******' : (authState.memberDetails?.account?.cash?.amount || '0.00') }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-gray-500">Chips</p>
                  <p class="font-semibold text-purple-700">{{ isBalanceHidden ? '******' : (authState.memberDetails?.account?.chips?.amount || '0.00') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Section -->
        <div class="bg-white p-4 rounded-lg shadow-md">
          <div class="flex items-center mb-4">
            <div class="bg-yellow-100 p-2 rounded-full mr-3">
              <i class="fas fa-chart-bar text-yellow-500"></i>
            </div>
            <h3 class="text-lg font-semibold">Reports</h3>
          </div>
          <!-- Transaction History Section Hidden -->
        </div>
      </div>
      
      <!-- Bank Accounts -->
      <div class="bg-white p-4 rounded-lg shadow-md">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div class="bg-indigo-100 p-2 rounded-full mr-3">
              <i class="fas fa-university text-indigo-500"></i>
            </div>
            <h3 class="text-lg font-semibold">Bank Accounts</h3>
          </div>
          <router-link 
            to="/wallet/banks"
            class="text-indigo-500 hover:text-indigo-600 text-sm font-medium"
          >
            <i class="fas fa-plus-circle mr-1"></i>Add New
          </router-link>
        </div>
        
        <div v-if="authState.memberDetails.banks && authState.memberDetails.banks.length > 0">
          <div 
            v-for="(bank, index) in authState.memberDetails.banks" 
            :key="index" 
            class="border rounded-lg p-3 mb-3 last:mb-0"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-800">{{ bank.bank }}</p>
                <p class="text-sm text-gray-600">{{ bank.name }}</p>
                <p class="text-sm text-gray-500">{{ bank.number }}</p>
              </div>
              <div class="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                Primary
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-gray-500 mb-2">No bank accounts added yet</p>
          <router-link 
            to="/wallet/banks" 
            class="text-indigo-500 font-medium hover:text-indigo-600"
          >
            Add your first bank account
          </router-link>
        </div>
      </div>

      <!-- Import AccountSettingsModal component in script section -->
      <AccountSettingsModal 
        :is-open="showAccountSettings" 
        @close="showAccountSettings = false"
        @profile-updated="handleProfileUpdated"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { authState } from '@/store/auth';
import AccountSettingsModal from '@/components/AccountSettingsModal.vue';
import { MemberDetails } from '@/types/api';

export default defineComponent({
  name: 'UserProfile',
  components: {
    AccountSettingsModal,
  },
  setup() {
    const isBalanceHidden = ref(true);
    const showAccountSettings = ref(false);

    const toggleBalanceVisibility = () => {
      isBalanceHidden.value = !isBalanceHidden.value;
    };

    // Derive balances using wallet first, fallback to legacy account fields
    const mainBalance = computed(() => {
      const details: any = authState.memberDetails as any;
      if (details?.wallet && details.wallet.value !== undefined && details.wallet.value !== null) {
        const num = Number(details.wallet.value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
      }
      return details?.account?.cash?.amount ?? '0.00';
    });

    const bonusBalance = computed(() => {
      const details: any = authState.memberDetails as any;
      if (details?.wallet && details.wallet.bonus !== undefined && details.wallet.bonus !== null) {
        const num = Number(details.wallet.bonus);
        return isNaN(num) ? '0.00' : num.toFixed(2);
      }
      return details?.account?.bonus?.amount ?? '0.00';
    });

    const handleProfileUpdated = (updatedDetails: MemberDetails) => {
      // Update any local user information if needed
      console.log('Profile updated:', updatedDetails);
      // Refresh user details or perform other actions
    };

    return {
      authState,
      isBalanceHidden,
      toggleBalanceVisibility,
      showAccountSettings,
      handleProfileUpdated,
      mainBalance,
      bonusBalance
    };
  }
});
</script>

<style scoped>
.grid {
  grid-auto-rows: minmax(min-content, max-content);
}
</style>
  