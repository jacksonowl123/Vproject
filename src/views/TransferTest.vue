<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
        <h1 class="text-2xl font-bold mb-2">🔄 Transfer Test</h1>
        <p class="text-blue-100">Test transfer operations between eWallet and game platforms</p>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="bg-white/10 rounded-lg p-3">
            <div class="text-blue-200">API Endpoint (Transfer To)</div>
            <div class="font-mono">transactions.transferto</div>
          </div>
          <div class="bg-white/10 rounded-lg p-3">
            <div class="text-blue-200">API Endpoint (Transfer From)</div>
            <div class="font-mono">transactions.transferfrom</div>
          </div>
          <div class="bg-white/10 rounded-lg p-3">
            <div class="text-blue-200">Authentication</div>
            <div class="font-mono">Bearer Token</div>
          </div>
        </div>
      </div>

      <!-- Current Balance -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">💰 Current Balance</h2>
          <button 
            @click="loadCurrentBalance" 
            :disabled="isLoading"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': isLoading }"></i>
            Refresh
          </button>
        </div>
        
        <div v-if="memberBalance" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="text-green-600 text-sm font-medium">eWallet Balance</div>
            <div class="text-2xl font-bold text-green-800">
              {{ memberBalance.currency }} {{ memberBalance.amount }}
            </div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="text-blue-600 text-sm font-medium">Total Platform Balance</div>
            <div class="text-2xl font-bold text-blue-800">
              {{ memberBalance.currency }} {{ totalPlatformBalance }}
            </div>
          </div>
        </div>
        
        <div v-else class="text-gray-500 text-center py-4">
          <i class="fas fa-wallet text-4xl mb-2"></i>
          <p>Click refresh to load balance information</p>
        </div>
      </div>

      <!-- Transfer Operations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Transfer To Platform -->
        <div id="transfer-to-section" class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center mb-4">
            <div class="bg-blue-100 p-3 rounded-lg mr-4">
              <i class="fas fa-arrow-right text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">Transfer To Platform</h3>
              <p class="text-gray-600 text-sm">Move credits from eWallet to game platform</p>
            </div>
          </div>

          <form @submit.prevent="handleTransferTo" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Platform
              </label>
              <select 
                v-model="transferToForm.platformto" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a platform...</option>
                <option v-for="platform in commonPlatforms" :key="platform.id" :value="platform.id">
                  {{ platform.name }} (ID: {{ platform.id }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Amount (Minimum: 10.00)
              </label>
              <input 
                v-model.number="transferToForm.amount" 
                type="number" 
                step="0.01" 
                min="10"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button 
              type="submit" 
              :disabled="isTransferringTo || !transferToForm.platformto || transferToForm.amount < 10"
              class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <span v-if="isTransferringTo">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Processing Transfer...
              </span>
              <span v-else>
                <i class="fas fa-arrow-right mr-2"></i>
                Transfer to Platform
              </span>
            </button>
          </form>
        </div>

        <!-- Transfer From Platform -->
        <div id="transfer-from-section" class="bg-white rounded-lg shadow-lg p-6">
          <div class="flex items-center mb-4">
            <div class="bg-green-100 p-3 rounded-lg mr-4">
              <i class="fas fa-arrow-left text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">Transfer From Platform</h3>
              <p class="text-gray-600 text-sm">Move credits from game platform to eWallet</p>
            </div>
          </div>

          <form @submit.prevent="handleTransferFrom" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Platform
              </label>
              <select 
                v-model="transferFromForm.platformfrom" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Choose a platform...</option>
                <option v-for="platform in commonPlatforms" :key="platform.id" :value="platform.id">
                  {{ platform.name }} (ID: {{ platform.id }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Amount (Minimum: 10.00)
              </label>
              <input 
                v-model.number="transferFromForm.amount" 
                type="number" 
                step="0.01" 
                min="10"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <button 
              type="submit" 
              :disabled="isTransferringFrom || !transferFromForm.platformfrom || transferFromForm.amount < 10"
              class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <span v-if="isTransferringFrom">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Processing Transfer...
              </span>
              <span v-else>
                <i class="fas fa-arrow-left mr-2"></i>
                Transfer from Platform
              </span>
            </button>
          </form>
        </div>
      </div>

      <!-- Platform Balances -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-800">🎮 Platform Balances</h2>
          <button 
            @click="loadPlatformBalances" 
            :disabled="isLoading"
            class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': isLoading }"></i>
            Refresh
          </button>
        </div>

        <div v-if="platformBalances.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="platform in platformBalances" 
            :key="platform.platformid"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="font-semibold text-gray-800">{{ platform.platformname }}</h3>
                <p class="text-sm text-gray-500">ID: {{ platform.platformid }}</p>
              </div>
              <span 
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  platform.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ platform.status === 1 ? 'Online' : 'Offline' }}
              </span>
            </div>
            
            <div class="mb-3">
              <div class="text-sm text-gray-600">Balance</div>
              <div class="text-lg font-bold text-blue-600">
                {{ platform.balance.currency }} {{ platform.balance.amount }}
              </div>
            </div>

            <div class="flex space-x-2">
              <button 
                @click="quickTransferTo(platform.platformid)"
                class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors"
              >
                Transfer In
              </button>
              <button 
                @click="quickTransferFrom(platform.platformid)"
                :disabled="parseFloat(platform.balance.amount) <= 0"
                class="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm py-2 px-3 rounded transition-colors"
              >
                Transfer Out
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center text-gray-500 py-8">
          <i class="fas fa-gamepad text-4xl mb-2"></i>
          <p>No platform balance data available. Click refresh to load.</p>
        </div>
      </div>

      <!-- Transfer History / API Response Log -->
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">📊 Transfer Activity Log</h2>
        
        <div v-if="transferHistory.length > 0" class="space-y-3">
          <div 
            v-for="(transfer, index) in transferHistory" 
            :key="index"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center">
                <span 
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3',
                    transfer.type === 'to' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  ]"
                >
                  <i :class="transfer.type === 'to' ? 'fas fa-arrow-right' : 'fas fa-arrow-left'" class="mr-1"></i>
                  {{ transfer.type === 'to' ? 'Transfer To' : 'Transfer From' }}
                </span>
                <span class="text-sm text-gray-500">{{ formatDate(transfer.timestamp) }}</span>
              </div>
              <span 
                :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  transfer.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ transfer.success ? 'Success' : 'Failed' }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-700">Platform:</span>
                <span class="ml-2">{{ transfer.platformName }} (ID: {{ transfer.platformId }})</span>
              </div>
              <div>
                <span class="font-medium text-gray-700">Amount:</span>
                <span class="ml-2">{{ transfer.amount }}</span>
              </div>
              <div v-if="transfer.serial">
                <span class="font-medium text-gray-700">Serial:</span>
                <span class="ml-2 font-mono text-xs">{{ transfer.serial }}</span>
              </div>
            </div>

            <div v-if="transfer.response" class="mt-3">
              <details class="cursor-pointer">
                <summary class="text-sm font-medium text-gray-700 hover:text-gray-900">View API Response</summary>
                <pre class="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">{{ JSON.stringify(transfer.response, null, 2) }}</pre>
              </details>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center text-gray-500 py-8">
          <i class="fas fa-history text-4xl mb-2"></i>
          <p>No transfer activity yet. Perform a transfer to see the activity log.</p>
        </div>
      </div>

      <!-- Common Platform IDs Reference -->
      <div class="bg-white rounded-lg shadow-lg p-6 mt-8">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">📋 Platform ID Reference</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div 
            v-for="platform in commonPlatforms" 
            :key="platform.id"
            class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
          >
            <span class="font-medium text-gray-800">{{ platform.name }}</span>
            <span class="text-sm text-gray-600 font-mono">ID: {{ platform.id }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';
import { getPlatformName, PLATFORM_IDS } from '@/utils/reference-ids';
import { useToast } from 'vue-toastification';

interface TransferActivity {
  type: 'to' | 'from';
  platformId: number;
  platformName: string;
  amount: number;
  timestamp: Date;
  success: boolean;
  response?: any;
  serial?: string;
}

export default defineComponent({
  name: 'TransferTest',
  setup() {
    const toast = useToast();
    
    // Loading states
    const isLoading = ref(false);
    const isTransferringTo = ref(false);
    const isTransferringFrom = ref(false);
    
    // Data
    const memberBalance = ref<any>(null);
    const platformBalances = ref<any[]>([]);
    const transferHistory = ref<TransferActivity[]>([]);
    
    // Forms
    const transferToForm = reactive({
      amount: 10.0,
      platformto: 39
    });
    
    const transferFromForm = reactive({
      amount: 10.0,
      platformfrom: 39
    });
    
    // Common platforms for reference - generate from PLATFORM_IDS
    const commonPlatforms = Object.entries(PLATFORM_IDS).map(([key, id]) => ({
      id,
      name: getPlatformName(id)
    }));
    
    // Computed
    const totalPlatformBalance = computed(() => {
      if (!platformBalances.value.length) return '0.00';
      return platformBalances.value.reduce((total, platform) => {
        return total + parseFloat(platform.balance.amount || '0');
      }, 0).toFixed(2);
    });
    
    // Methods
    const loadCurrentBalance = async () => {
      try {
        isLoading.value = true;
        const response = await api.getMemberDetails();
        
        if (response && response.account) {
          memberBalance.value = response.account.cash;
          console.log('✅ Member balance loaded:', memberBalance.value);
        }
      } catch (error) {
        console.error('❌ Failed to load member balance:', error);
        toast.error('Failed to load member balance');
      } finally {
        isLoading.value = false;
      }
    };
    
    const loadPlatformBalances = async () => {
      try {
        isLoading.value = true;
        const response = await api.getAllPlatformsBalance();
        
        if (response.success && response.data?.platforms) {
          platformBalances.value = response.data.platforms;
          console.log('✅ Platform balances loaded:', platformBalances.value);
        }
      } catch (error) {
        console.error('❌ Failed to load platform balances:', error);
        toast.error('Failed to load platform balances');
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleTransferTo = async () => {
      if (transferToForm.amount < 10) {
        toast.error('Minimum transfer amount is 10.00');
        return;
      }
      
      try {
        isTransferringTo.value = true;
        
        console.log('🔄 Transfer To request:', {
          amount: transferToForm.amount,
          platformto: transferToForm.platformto
        });
        
        const response = await api.transferTo(transferToForm.amount, transferToForm.platformto);
        
        console.log('✅ Transfer To response:', response);
        
        const platformName = commonPlatforms.find(p => p.id === transferToForm.platformto)?.name || 'Unknown Platform';
        
        // Add to history
        transferHistory.value.unshift({
          type: 'to',
          platformId: transferToForm.platformto,
          platformName,
          amount: transferToForm.amount,
          timestamp: new Date(),
          success: response.success,
          response: response.data,
          serial: response.data?.serial
        });
        
        if (response.success) {
          if (response.data?.status === 2) {
            toast.success(`✅ Transfer completed! Serial: ${response.data.serial || 'N/A'}`);
            
            // Refresh balances
            await loadCurrentBalance();
            await loadPlatformBalances();
          } else {
            toast.warning(`⚠️ Transfer status: ${response.data?.status}. Please check the response.`);
          }
        } else {
          toast.error('❌ Transfer failed');
        }
        
      } catch (error: any) {
        console.error('❌ Transfer To error:', error);
        toast.error(`Transfer failed: ${error.message}`);
        
        // Add failed transfer to history
        const platformName = commonPlatforms.find(p => p.id === transferToForm.platformto)?.name || 'Unknown Platform';
        transferHistory.value.unshift({
          type: 'to',
          platformId: transferToForm.platformto,
          platformName,
          amount: transferToForm.amount,
          timestamp: new Date(),
          success: false,
          response: { error: error.message }
        });
      } finally {
        isTransferringTo.value = false;
      }
    };
    
    const handleTransferFrom = async () => {
      if (transferFromForm.amount < 10) {
        toast.error('Minimum transfer amount is 10.00');
        return;
      }
      
      try {
        isTransferringFrom.value = true;
        
        console.log('🔄 Transfer From request:', {
          amount: transferFromForm.amount,
          platformfrom: transferFromForm.platformfrom
        });
        
        const response = await api.transferFrom(transferFromForm.amount, transferFromForm.platformfrom);
        
        console.log('✅ Transfer From response:', response);
        
        const platformName = commonPlatforms.find(p => p.id === transferFromForm.platformfrom)?.name || 'Unknown Platform';
        
        // Add to history
        transferHistory.value.unshift({
          type: 'from',
          platformId: transferFromForm.platformfrom,
          platformName,
          amount: transferFromForm.amount,
          timestamp: new Date(),
          success: response.success,
          response: response.data,
          serial: response.data?.serial
        });
        
        if (response.success) {
          if (response.data?.status === 2) {
            toast.success(`✅ Transfer completed! Serial: ${response.data.serial || 'N/A'}`);
            
            // Refresh balances
            await loadCurrentBalance();
            await loadPlatformBalances();
          } else {
            toast.warning(`⚠️ Transfer status: ${response.data?.status}. Please check the response.`);
          }
        } else {
          toast.error('❌ Transfer failed');
        }
        
      } catch (error: any) {
        console.error('❌ Transfer From error:', error);
        toast.error(`Transfer failed: ${error.message}`);
        
        // Add failed transfer to history
        const platformName = commonPlatforms.find(p => p.id === transferFromForm.platformfrom)?.name || 'Unknown Platform';
        transferHistory.value.unshift({
          type: 'from',
          platformId: transferFromForm.platformfrom,
          platformName,
          amount: transferFromForm.amount,
          timestamp: new Date(),
          success: false,
          response: { error: error.message }
        });
      } finally {
        isTransferringFrom.value = false;
      }
    };
    
    const quickTransferTo = (platformId: number) => {
      transferToForm.platformto = platformId;
      transferToForm.amount = 10.0;
      document.querySelector('#transfer-to-section')?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const quickTransferFrom = (platformId: number) => {
      transferFromForm.platformfrom = platformId;
      transferFromForm.amount = 10.0;
      document.querySelector('#transfer-from-section')?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const formatDate = (date: Date) => {
      return date.toLocaleString();
    };
    
    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        loadCurrentBalance(),
        loadPlatformBalances()
      ]);
    });
    
    return {
      // State
      isLoading,
      isTransferringTo,
      isTransferringFrom,
      memberBalance,
      platformBalances,
      transferHistory,
      
      // Forms
      transferToForm,
      transferFromForm,
      
      // Data
      commonPlatforms,
      totalPlatformBalance,
      
      // Methods
      loadCurrentBalance,
      loadPlatformBalances,
      handleTransferTo,
      handleTransferFrom,
      quickTransferTo,
      quickTransferFrom,
      formatDate
    };
  }
});
</script>

<style scoped>
/* Custom scrollbar for code blocks */
pre::-webkit-scrollbar {
  height: 6px;
}

pre::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Animation for loading states */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style> 