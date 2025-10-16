<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold mb-6">
        <i class="fas fa-wallet mr-2 text-blue-500"></i>
        Platform Balance Test
      </h1>
      
      <!-- Single Platform Balance Section -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">Single Platform Balance</h2>
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex flex-wrap gap-4 items-end mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Platform ID:</label>
              <input 
                type="number" 
                v-model="selectedPlatformId" 
                class="border border-gray-300 rounded-lg px-3 py-2 w-32"
                placeholder="39"
                min="1"
              />
            </div>
            <button 
              @click="fetchSinglePlatformBalance" 
              :disabled="loadingSingle || !selectedPlatformId"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
            >
              <span v-if="loadingSingle">
                <i class="fas fa-spinner fa-spin mr-2"></i>Loading...
              </span>
              <span v-else>
                <i class="fas fa-search mr-2"></i>Get Balance
              </span>
            </button>
          </div>
          
          <!-- Single Platform Result -->
          <div v-if="singlePlatformResult">
            <h3 class="font-medium mb-2">Result:</h3>
            <div class="bg-white p-3 rounded border">
              <pre class="text-sm overflow-auto">{{ JSON.stringify(singlePlatformResult, null, 2) }}</pre>
            </div>
          </div>
          
          <div v-if="singlePlatformError" class="text-red-600 text-sm mt-2">
            <i class="fas fa-exclamation-circle mr-1"></i>
            {{ singlePlatformError }}
          </div>
        </div>
      </div>
      
      <!-- All Platforms Balance Section -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">All Platforms Balance</h2>
        <div class="bg-gray-50 p-4 rounded-lg">
          <button 
            @click="fetchAllPlatformsBalance" 
            :disabled="loadingAll"
            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition mb-4"
          >
            <span v-if="loadingAll">
              <i class="fas fa-spinner fa-spin mr-2"></i>Loading...
            </span>
            <span v-else>
              <i class="fas fa-layer-group mr-2"></i>Get All Balances
            </span>
          </button>
          
          <!-- All Platforms Result -->
          <div v-if="allPlatformsResult">
            <h3 class="font-medium mb-2">Results ({{ allPlatformsResult.length }} platforms):</h3>
            
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div 
                v-for="platform in allPlatformsResult" 
                :key="platform.platformid"
                class="bg-white p-4 rounded-lg border shadow-sm"
              >
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-bold text-gray-800">{{ platform.platformname || getPlatformName(platform.platformid) }}</h4>
                    <p class="text-sm text-gray-600">{{ platform.platformcode }}</p>
                  </div>
                  <span 
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      platform.status === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ platform.status === 0 ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                
                <div class="mt-3">
                  <p class="text-sm text-gray-600">Balance:</p>
                  <p class="text-xl font-bold text-blue-600">
                    {{ platform.balance?.amount || '0.00' }}
                  </p>
                </div>
                
                <div class="mt-2 text-xs text-gray-500">
                  Platform ID: {{ platform.platformid }}
                </div>
              </div>
            </div>
            
            <!-- Raw Data -->
            <details class="mt-4">
              <summary class="cursor-pointer font-medium text-gray-700">View Raw Data</summary>
              <div class="bg-white p-3 rounded border mt-2">
                <pre class="text-sm overflow-auto max-h-64">{{ JSON.stringify(allPlatformsResult, null, 2) }}</pre>
              </div>
            </details>
          </div>
          
          <div v-if="allPlatformsError" class="text-red-600 text-sm mt-2">
            <i class="fas fa-exclamation-circle mr-1"></i>
            {{ allPlatformsError }}
          </div>
        </div>
      </div>
      
      <!-- Common Platform IDs Reference -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <h3 class="font-medium text-blue-800 mb-2">Common Platform IDs:</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          <div v-for="platform in commonPlatforms" :key="platform.id" class="flex justify-between">
            <span>{{ platform.name }}:</span>
            <span class="font-mono">{{ platform.id }}</span>
          </div>
        </div>
      </div>
      
      <!-- API Information -->
      <div class="mt-6 pt-6 border-t text-sm text-gray-600">
        <h3 class="font-medium mb-2">API Endpoints:</h3>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>Single Platform:</strong> <code>platforms.balance</code> with payload <code>{"platformid": 39}</code></li>
          <li><strong>All Platforms:</strong> <code>platforms.balances</code> with empty payload</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';
import { getPlatformName, PLATFORM_IDS } from '@/utils/reference-ids';

interface PlatformBalance {
  platformid: number;
  platformcode: string;
  platformname: string;
  status: number;
  message: string;
  rawdata: string;
  createuser: any;
  balance: {
    amount: string;
    reference: any;
  };
  interactive: any;
  authenticate: any;
  launch: any;
}

export default defineComponent({
  name: 'PlatformBalanceTest',
  setup() {
    const selectedPlatformId = ref<number>(39);
    const loadingSingle = ref(false);
    const loadingAll = ref(false);
    const singlePlatformResult = ref<PlatformBalance | null>(null);
    const allPlatformsResult = ref<PlatformBalance[]>([]);
    const singlePlatformError = ref('');
    const allPlatformsError = ref('');

    // Generate platform list from PLATFORM_IDS
    const commonPlatforms = Object.entries(PLATFORM_IDS).map(([key, id]) => ({
      id,
      name: getPlatformName(id)
    }));

    const fetchSinglePlatformBalance = async () => {
      if (!selectedPlatformId.value) return;
      
      loadingSingle.value = true;
      singlePlatformError.value = '';
      singlePlatformResult.value = null;
      
      try {
        console.log(`🔍 Fetching balance for platform ${selectedPlatformId.value}...`);
        const response = await api.getPlatformBalance(selectedPlatformId.value);
        
        console.log('✅ Single Platform Balance Response:', response);
        
        if (response.success && response.data) {
          singlePlatformResult.value = response.data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('❌ Single Platform Balance Error:', err);
        singlePlatformError.value = err.message || 'Failed to fetch platform balance';
      } finally {
        loadingSingle.value = false;
      }
    };

    const fetchAllPlatformsBalance = async () => {
      loadingAll.value = true;
      allPlatformsError.value = '';
      allPlatformsResult.value = [];
      
      try {
        console.log('🔍 Fetching all platforms balance...');
        const response = await api.getAllPlatformsBalance();
        
        console.log('✅ All Platforms Balance Response:', response);
        
        if (response.success && response.data && Array.isArray(response.data)) {
          allPlatformsResult.value = response.data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('❌ All Platforms Balance Error:', err);
        allPlatformsError.value = err.message || 'Failed to fetch all platforms balance';
      } finally {
        loadingAll.value = false;
      }
    };

    return {
      selectedPlatformId,
      loadingSingle,
      loadingAll,
      singlePlatformResult,
      allPlatformsResult,
      singlePlatformError,
      allPlatformsError,
      commonPlatforms,
      fetchSinglePlatformBalance,
      fetchAllPlatformsBalance
    };
  }
});
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
}
</style> 