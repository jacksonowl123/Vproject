<template>
  <div class="max-w-6xl mx-auto p-6">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h1 class="text-2xl font-bold mb-6">
        <i class="fas fa-gift mr-2 text-green-500"></i>
        Incentives Test
      </h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading incentives...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <div class="text-red-500 text-5xl mb-4">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <h3 class="text-xl font-medium text-gray-700 mb-2">Error Loading Incentives</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="fetchIncentives" 
          class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
        >
          Try Again
        </button>
      </div>
      
      <!-- Content -->
      <div v-else>
        <!-- Raw API Response -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-3">Raw API Response:</h2>
          <div class="bg-gray-100 p-4 rounded-lg">
            <pre class="text-sm overflow-auto max-h-64">{{ JSON.stringify(rawResponse, null, 2) }}</pre>
          </div>
        </div>
        
        <!-- System Incentives -->
        <div v-if="systemIncentives.length > 0">
          <h2 class="text-lg font-semibold mb-4">
            System Incentives ({{ systemIncentives.length }})
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              v-for="incentive in systemIncentives" 
              :key="incentive.iid"
              class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <!-- Incentive Header -->
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-800">{{ incentive.name }}</h3>
                  <p v-if="incentive.description" class="text-gray-600 text-sm">{{ incentive.description }}</p>
                </div>
                <div class="text-right">
                  <span 
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      incentive.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ incentive.status === 1 ? 'Active' : 'Inactive' }}
                  </span>
                  <p class="text-xs text-gray-500 mt-1">ID: {{ incentive.iid }}</p>
                </div>
              </div>
              
              <!-- Incentive Details -->
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Type:</span>
                  <span class="font-medium">{{ getIncentiveType(incentive.type) }}</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Atomic:</span>
                  <span class="font-medium">{{ incentive.atomic ? 'Yes' : 'No' }}</span>
                </div>
                
                <div v-if="incentive.events && incentive.events.length > 0">
                  <span class="text-gray-600">Events:</span>
                  <div class="mt-1">
                    <span 
                      v-for="event in incentive.events" 
                      :key="event"
                      class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1"
                    >
                      {{ event }}
                    </span>
                  </div>
                </div>
                
                <!-- Decoded Data -->
                <div v-if="incentive.decodedData" class="mt-4 p-3 bg-green-50 rounded">
                  <h4 class="font-medium text-green-800 mb-2">Incentive Details:</h4>
                  <div class="space-y-1 text-sm">
                    <div v-if="incentive.decodedData.unit" class="flex justify-between">
                      <span>Unit:</span>
                      <span class="font-medium">{{ incentive.decodedData.unit }}</span>
                    </div>
                    <div v-if="incentive.decodedData.rate !== undefined" class="flex justify-between">
                      <span>Rate:</span>
                      <span class="font-medium">{{ incentive.decodedData.rate }}{{ incentive.decodedData.unit || '' }}</span>
                    </div>
                    <div v-if="incentive.decodedData.minamt !== undefined" class="flex justify-between">
                      <span>Min Amount:</span>
                      <span class="font-medium">{{ incentive.decodedData.minamt }}</span>
                    </div>
                    <div v-if="incentive.decodedData.maxamt !== undefined" class="flex justify-between">
                      <span>Max Amount:</span>
                      <span class="font-medium">{{ incentive.decodedData.maxamt }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- Date Range -->
                <div v-if="incentive.datebegin && incentive.dateend" class="mt-4 p-3 bg-blue-50 rounded">
                  <h4 class="font-medium text-blue-800 mb-2">Validity Period:</h4>
                  <div class="text-sm space-y-1">
                    <div><strong>Start:</strong> {{ formatDate(incentive.datebegin) }}</div>
                    <div><strong>End:</strong> {{ formatDate(incentive.dateend) }}</div>
                  </div>
                </div>
                
                <!-- Time Restrictions -->
                <div v-if="incentive.times && incentive.times.length > 0" class="mt-4 p-3 bg-purple-50 rounded">
                  <h4 class="font-medium text-purple-800 mb-2">Time Restrictions:</h4>
                  <div class="space-y-1 text-sm">
                    <div v-for="time in incentive.times" :key="time.iid" class="flex justify-between">
                      <span>{{ getDayName(time.day) }}:</span>
                      <span class="font-medium">
                        {{ time.active ? `${formatTime(time.tmst)} - ${formatTime(time.tmed)}` : 'Inactive' }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Plugin Class -->
                <div v-if="incentive.pluginclass" class="mt-4 text-xs text-gray-500">
                  <strong>Plugin:</strong> {{ incentive.pluginclass }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Results -->
        <div v-else class="text-center py-12">
          <div class="text-gray-400 text-5xl mb-4">
            <i class="fas fa-gift"></i>
          </div>
          <h3 class="text-xl font-medium text-gray-600 mb-2">No Incentives Found</h3>
          <p class="text-gray-500">No system incentives are currently available</p>
        </div>
        
        <!-- Refresh Button -->
        <div class="mt-8 pt-6 border-t text-center">
          <button 
            @click="fetchIncentives" 
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          >
            <i class="fas fa-sync-alt mr-2"></i>
            Refresh Incentives
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';

interface Incentive {
  iid: number;
  name: string;
  description?: string;
  status: number;
  atomic: boolean;
  type: number;
  pluginclass: string;
  events: string[];
  data: string;
  decodedData?: any;
  datebegin?: {
    date: number;
    datestring: string;
    datelong: number;
  };
  dateend?: {
    date: number;
    datestring: string;
    datelong: number;
  };
  times?: Array<{
    iid: number;
    day: number;
    active: boolean;
    tmst: number;
    tmed: number;
  }>;
}

export default defineComponent({
  name: 'IncentivesTest',
  setup() {
    const loading = ref(false);
    const error = ref('');
    const rawResponse = ref<any>(null);
    const incentivesData = ref<any>(null);

    const systemIncentives = computed<Incentive[]>(() => {
      if (incentivesData.value && incentivesData.value.system) {
        return incentivesData.value.system;
      }
      return [];
    });

    const fetchIncentives = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        console.log('🔍 Fetching incentives...');
        const response = await api.getIncentives();
        
        console.log('✅ Incentives Response:', response);
        rawResponse.value = response;
        
        if (response.success && response.data) {
          incentivesData.value = response.data;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('❌ Incentives Error:', err);
        error.value = err.message || 'Failed to fetch incentives';
      } finally {
        loading.value = false;
      }
    };

    const getIncentiveType = (type: number): string => {
      switch (type) {
        case 1: return 'Bonus';
        case 2: return 'Free Spins';
        case 3: return 'Cashback';
        case 4: return 'Reload';
        default: return `Type ${type}`;
      }
    };

    const formatDate = (dateObj: any): string => {
      if (!dateObj || !dateObj.datestring) return 'N/A';
      return dateObj.datestring;
    };

    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const getDayName = (day: number): string => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[day] || `Day ${day}`;
    };

    onMounted(() => {
      fetchIncentives();
    });

    return {
      loading,
      error,
      rawResponse,
      systemIncentives,
      fetchIncentives,
      getIncentiveType,
      formatDate,
      formatTime,
      getDayName
    };
  }
});
</script>

<style scoped>
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 