<!-- src/views/TopUpPage.vue -->
<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Top Up Your Account</h2>
      <button @click="$router.go(-1)" class="text-blue-600 hover:text-blue-800 flex items-center">
        <span class="material-icons mr-1">arrow_back</span> Back
      </button>
    </div>

    <!-- Balance Display -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-gray-500 text-sm font-medium">Cash Balance</h3>
          <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Main</span>
        </div>
        <div class="text-3xl font-bold">{{ userBalance.cash.currency }} {{ userBalance.cash.amount }}</div>
        <div class="text-gray-500 text-sm mt-2">Available for withdrawal and in-game transfers</div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-gray-500 text-sm font-medium">Chips Balance</h3>
          <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Game</span>
        </div>
        <div class="text-3xl font-bold">{{ userBalance.chips.currency }} {{ userBalance.chips.amount }}</div>
        <div class="text-gray-500 text-sm mt-2">Used for playing games in the platform</div>
      </div>
    </div>

    <!-- Top Up Form -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4">Add Funds</h3>
      
      <!-- Balance Type Selection -->
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2">Select Balance Type</label>
        <div class="grid grid-cols-2 gap-4">
          <button 
            @click="selectedType = 'cash'"
            :class="[
              'py-3 px-4 text-center border font-medium rounded-lg transition-colors',
              selectedType === 'cash'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >
            Cash Balance
          </button>
          <button 
            @click="selectedType = 'chips'"
            :class="[
              'py-3 px-4 text-center border font-medium rounded-lg transition-colors',
              selectedType === 'chips'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            ]"
          >
            Chips Balance
          </button>
        </div>
      </div>
      
      <!-- Amount Input -->
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="top-up-amount">
          Amount ({{ userBalance[selectedType].currency }})
        </label>
        <div class="flex items-center">
          <span class="bg-gray-100 px-4 py-3 border border-r-0 rounded-l-lg">{{ userBalance[selectedType].currency }}</span>
          <input 
            id="top-up-amount" 
            v-model="amount" 
            type="number" 
            min="10" 
            step="10"
            class="w-full p-3 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Enter amount (min: 10)"
          />
        </div>
        <div class="text-gray-500 text-xs mt-1">Minimum amount: {{ userBalance[selectedType].currency }} 10.00</div>
      </div>

      <!-- Quick Amount Buttons -->
      <div class="mb-6">
        <label class="block text-gray-700 text-sm font-bold mb-2">Quick Add</label>
        <div class="grid grid-cols-4 gap-2">
          <button 
            v-for="quickAmount in quickAmounts" 
            :key="quickAmount"
            @click="amount = quickAmount"
            class="py-2 px-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {{ userBalance[selectedType].currency }} {{ quickAmount }}
          </button>
        </div>
      </div>
      
      <!-- Submit Button -->
      <button 
        @click="handleTopUp" 
        class="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 w-full transition-colors"
        :disabled="isProcessing || !amount || parseFloat(amount) < 10"
      >
        <span v-if="isProcessing">
          <i class="fas fa-spinner fa-spin mr-2"></i> Processing...
        </span>
        <span v-else>
          Add Funds Now
        </span>
      </button>
    </div>

    <!-- Payment Methods -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-xl font-semibold mb-4">Payment Methods</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="method in paymentMethods" :key="method.name" class="border p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow" @click="selectPaymentMethod(method)">
          <div class="bg-gray-100 p-3 rounded-lg flex items-center justify-center h-16 mb-3">
            <span class="material-icons text-gray-600 text-2xl">{{ method.icon }}</span>
          </div>
          <h4 class="text-center font-medium">{{ method.name }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';
import Swal from 'sweetalert2';

export default defineComponent({
  name: 'TopUpPage',
  setup() {
    const userBalance = reactive({
      cash: {
        currency: 'MYR',
        amount: '0.00'
      },
      chips: {
        currency: 'MYR',
        amount: '0.00'
      }
    });
    
    const selectedType = ref('cash');
    const amount = ref('');
    const isProcessing = ref(false);
    const quickAmounts = [50, 100, 200, 500];
    
    const paymentMethods = [
      { name: 'Credit Card', icon: 'credit_card', path: 'card' },
      { name: 'Bank Transfer', icon: 'account_balance', path: 'bank' },
      { name: 'E-Wallet', icon: 'account_balance_wallet', path: 'ewallet' },
      { name: 'QR Pay', icon: 'qr_code', path: 'qr' },
    ];

    // Fetch user balance
    const fetchUserBalance = async () => {
      try {
        const userData = await api.getMemberDetails();
        if (userData && userData.account) {
          if (userData.account.cash) {
            userBalance.cash = userData.account.cash;
          }
          if (userData.account.chips) {
            userBalance.chips = userData.account.chips;
          }
        }
      } catch (error) {
        console.error('Error fetching user balance:', error);
      }
    };

    // Handle top up
    const handleTopUp = async () => {
      if (!amount.value || parseFloat(amount.value) < 10) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Amount',
          text: 'Please enter an amount of at least 10.00',
          confirmButtonColor: '#0066FF',
        });
        return;
      }

      try {
        isProcessing.value = true;
        
        const response = await api.topUp(amount.value, selectedType.value);
        
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Top Up Successful!',
          text: `You have successfully added ${userBalance[selectedType.value].currency} ${amount.value} to your ${selectedType.value} balance.`,
          confirmButtonColor: '#0066FF',
        });
        
        // Update balance
        await fetchUserBalance();
        
        // Reset form
        amount.value = '';
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Top Up Failed',
          text: error.message || 'Failed to add funds. Please try again.',
          confirmButtonColor: '#0066FF',
        });
      } finally {
        isProcessing.value = false;
      }
    };

    const selectPaymentMethod = (method: any) => {
      // Currently just using our direct top-up in mock mode
      // In a real app, this would navigate to payment gateway
      Swal.fire({
        icon: 'info',
        title: 'Payment Method Selected',
        text: `You selected ${method.name}. This functionality is in development.`,
        confirmButtonColor: '#0066FF',
      });
    };

    onMounted(() => {
      fetchUserBalance();
    });

    return {
      userBalance,
      selectedType,
      amount,
      isProcessing,
      quickAmounts,
      paymentMethods,
      handleTopUp,
      selectPaymentMethod
    };
  }
});
</script>

<style scoped>
/* Add any additional styling here */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
  