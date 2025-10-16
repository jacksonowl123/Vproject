<template>
  <div class="gateway-deposit">
    <form @submit.prevent="submitDeposit">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2" for="amount">
          Amount
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            MYR
          </span>
          <input 
            id="amount" 
            v-model.number="amount" 
            type="number" 
            class="w-full p-3 pl-12 border rounded-lg" 
            placeholder="Enter amount"
            min="10"
            step="0.01"
            required
          />
        </div>
        <div class="flex flex-wrap gap-2 mt-3">
          <button 
            v-for="quickAmount in quickAmounts" 
            :key="quickAmount"
            @click="amount = quickAmount"
            type="button"
            class="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
          >
            MYR {{ quickAmount }}
          </button>
        </div>
      </div>
      
      <!-- Payment method (display only) -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
        <div class="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700">
          FPX
        </div>
        <p class="text-xs text-gray-500 mt-1">Processed via secure payment gateway.</p>
      </div>
      
      <button 
        type="submit" 
        class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        :disabled="isLoading || !isFormValid"
      >
        <span v-if="isLoading">
          <i class="fas fa-spinner fa-spin mr-2"></i>Processing...
        </span>
        <span v-else>
          Process Gateway Deposit
        </span>
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useToast } from 'vue-toastification';
import { laravelApi as api } from '@/services/laravelApi';

export default defineComponent({
  name: 'GatewayDeposit',
  emits: ['deposit-success', 'deposit-data'],
  setup(props, { emit }) {
    const toast = useToast();
    const isLoading = ref(false);
    const amount = ref(10.0);
    const redirect = ref(window.location.origin + '/deposit-result');
    const gateway = ref('pay2win');
    
    const quickAmounts = [50, 100, 500, 1000, 5000];
    
    const isFormValid = computed(() => {
      return amount.value >= 10;
    });
    
    const submitDeposit = async () => {
      if (!isFormValid.value) {
        toast.error('Please fill in all required fields. Minimum deposit amount is 10.00');
        return;
      }
      
      try {
        isLoading.value = true;
        
        const response = await api.depositGateway({
          amount: amount.value,
          redirect: redirect.value,
          gateway: gateway.value
        });
        
        // Emit the response data for display
        emit('deposit-data', response);
        
        if (response && response.success && response.data?.method === 'redirect' && response.data?.url) {
          // Auto redirect per API contract
          window.location.href = response.data.url as string;
          return;
        } else if (response && response.success) {
          toast.success('Gateway deposit processed successfully');
          // Emit success event
          emit('deposit-success');
        } else {
          toast.error('Gateway deposit failed. Please try again.');
        }
      } catch (error) {
        console.error('Gateway deposit error:', error);
        
        // Emit error data for display
        emit('deposit-data', { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error 
        });
        
        toast.error('Gateway deposit failed. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      isLoading,
      amount,
      quickAmounts,
      isFormValid,
      submitDeposit
    };
  }
});
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style> 