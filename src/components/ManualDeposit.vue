<template>
  <div class="manual-deposit-container p-6 bg-white rounded-lg shadow-lg">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Manual Deposit</h2>
    
    <!-- Info Banner -->
    <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas fa-info-circle text-blue-500 text-lg mt-0.5"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Manual Deposit Information</h3>
          <p class="text-sm text-blue-700 mt-1">
            This deposit will be processed through our secure backend system and requires manual approval. 
            Your account will be credited once approved by our team.
          </p>
        </div>
      </div>
    </div>

    <!-- Deposit Form -->
    <form @submit.prevent="submitDeposit" class="space-y-6">
      <!-- Amount Input -->
      <div>
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-2">
          Deposit Amount <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            MYR
          </span>
          <input 
            id="amount" 
            v-model="depositForm.amount"
            type="number" 
            step="0.01"
            min="10"
            max="100000"
            required
            class="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <button 
            v-for="amount in quickAmounts" 
            :key="amount"
            @click="depositForm.amount = amount.toString()"
            type="button"
            class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            MYR {{ amount }}
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">Minimum: MYR 10.00 | Maximum: MYR 100,000.00</p>
      </div>
      
      <!-- Incentive Selection -->
      <div>
        <label for="incentive" class="block text-sm font-medium text-gray-700 mb-2">
          Select Bonus <span class="text-red-500">*</span>
        </label>
        <select
          id="incentive"
          v-model="depositForm.incentiveid"
          required
          class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose a bonus option</option>
          <option v-for="incentive in incentives" :key="incentive.id" :value="incentive.id">
            {{ incentive.name }} ({{ incentive.percentage }}% bonus)
          </option>
        </select>
      </div>
      
      <!-- Remarks -->
      <div>
        <label for="remarks" class="block text-sm font-medium text-gray-700 mb-2">
          Remarks <span class="text-red-500">*</span>
        </label>
        <textarea 
          id="remarks" 
          v-model="depositForm.remarks"
          required
          rows="3"
          class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Enter deposit reference or remarks..."
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">Please provide any reference number or additional information</p>
      </div>
      
      <!-- Submit Button -->
      <button 
        type="submit" 
        :disabled="isLoading || !isFormValid"
        class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
      >
        <span v-if="isLoading" class="flex items-center justify-center">
          <i class="fas fa-spinner fa-spin mr-2"></i>
          Processing Deposit...
        </span>
        <span v-else class="flex items-center justify-center">
          <i class="fas fa-paper-plane mr-2"></i>
          Submit Manual Deposit
        </span>
      </button>
    </form>

    <!-- Success Response -->
    <div v-if="lastResponse && lastResponse.success" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas fa-check-circle text-green-500 text-lg"></i>
        </div>
        <div class="ml-3">
          <h3 class="font-medium text-green-800 mb-2">Deposit Submitted Successfully!</h3>
          <p class="text-green-700 text-sm mb-3">
            Your manual deposit request has been submitted and is pending approval. 
            You will be notified once it's processed.
          </p>
          <details class="text-xs">
            <summary class="cursor-pointer text-green-600 hover:text-green-800">View Response Details</summary>
            <pre class="mt-2 p-2 bg-green-100 rounded text-green-800 overflow-auto">{{ JSON.stringify(lastResponse, null, 2) }}</pre>
          </details>
        </div>
      </div>
    </div>

    <!-- Error Response -->
    <div v-if="(lastResponse && !lastResponse.success) || errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-circle text-red-500 text-lg"></i>
        </div>
        <div class="ml-3">
          <h3 class="font-medium text-red-800 mb-2">Deposit Failed</h3>
          <p class="text-red-700 text-sm mb-3">
            {{ errorMessage || lastResponse?.message || 'An error occurred while processing your deposit.' }}
          </p>
          <details v-if="lastResponse" class="text-xs">
            <summary class="cursor-pointer text-red-600 hover:text-red-800">View Error Details</summary>
            <pre class="mt-2 p-2 bg-red-100 rounded text-red-800 overflow-auto">{{ JSON.stringify(lastResponse, null, 2) }}</pre>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { laravelApi } from '@/services/laravelApi';

// Reactive data
    const isLoading = ref(false);
const lastResponse = ref<any>(null);
const errorMessage = ref<string>('');

const depositForm = ref({
  amount: '',
  incentiveid: '',
  remarks: ''
});

const incentives = ref([
  { id: 1, name: 'Welcome Bonus', percentage: 100 },
  { id: 2, name: 'Reload Bonus', percentage: 50 },
  { id: 3, name: 'VIP Bonus', percentage: 200 },
  { id: 4, name: 'No Bonus', percentage: 0 }
]);
    
    const quickAmounts = [50, 100, 500, 1000, 5000];
    
// Computed properties
    const isFormValid = computed(() => {
  return depositForm.value.amount && 
         parseFloat(depositForm.value.amount) >= 10 &&
         parseFloat(depositForm.value.amount) <= 100000 &&
         depositForm.value.incentiveid && 
         depositForm.value.remarks.trim().length >= 3;
    });
    
// Methods
    const submitDeposit = async () => {
      if (!isFormValid.value) {
    errorMessage.value = 'Please fill in all required fields correctly';
        return;
      }
      
        isLoading.value = true;
  errorMessage.value = '';
  lastResponse.value = null;

  try {
    console.log('🚀 Submitting manual deposit through Laravel backend');
    
    const response = await laravelApi.depositManual({
      amount: parseFloat(depositForm.value.amount),
      incentiveid: parseInt(depositForm.value.incentiveid),
      remarks: depositForm.value.remarks
        });
        
    lastResponse.value = response;
        
    if (response.success) {
      // Clear form on success
      depositForm.value = {
        amount: '',
        incentiveid: '',
        remarks: ''
      };
          
      // Emit success event for parent components
      window.dispatchEvent(new CustomEvent('manual-deposit-success', { 
        detail: response 
      }));
        }
  } catch (error: any) {
    console.error('Deposit submission error:', error);
    errorMessage.value = error.message || 'Deposit submission failed';
    lastResponse.value = {
          success: false, 
      message: error.message,
      error: error
    };
      } finally {
        isLoading.value = false;
      }
    };
    
// Test connection on mount for logging purposes only
onMounted(() => {
  laravelApi.testConnection().then(connected => {
    console.log('Laravel backend connection status:', connected ? 'Connected' : 'Disconnected');
  });
});
</script>

<style scoped>
.manual-deposit-container {
  max-width: 600px;
  margin: 0 auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 11px;
  max-height: 200px;
  overflow-y: auto;
}

/* Custom scrollbar for better UX */
pre::-webkit-scrollbar {
  width: 6px;
}

pre::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}

/* Input focus animations */
input:focus, select:focus, textarea:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Button hover effects */
button:not(:disabled):hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style> 