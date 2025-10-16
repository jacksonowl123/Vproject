<template>
  <div>
    <member-center-2>
      <!-- Deposit Content -->
      <div class="p-4 max-w-4xl mx-auto">
        <!-- Wallet Balance Card -->
        <div class="bg-white p-4 rounded-lg shadow-md mb-8">
          <div class="flex items-center mb-4">
            <div class="bg-blue-100 p-2 rounded-full mr-3">
              <i class="fas fa-wallet text-blue-500"></i>
            </div>
            <h3 class="text-xl font-semibold">Wallet Balance</h3>
            <button @click="toggleBalanceVisibility" class="ml-auto text-gray-500">
              <i :class="isBalanceHidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-100 p-3 rounded">
              <p class="text-gray-500 text-sm mb-1">Cash Balance</p>
              <p class="text-xl font-bold" :class="{'text-red-500': !authState.memberDetails?.account?.cash?.amount || authState.memberDetails?.account?.cash?.amount === '0.00'}">
                {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} 
                {{ isBalanceHidden ? '******' : (authState.memberDetails?.account?.cash?.amount || '0.00') }}
              </p>
            </div>
            <div class="bg-gray-100 p-3 rounded">
              <p class="text-gray-500 text-sm mb-1">Chips Balance</p>
              <p class="text-xl font-bold" :class="{'text-red-500': !authState.memberDetails?.account?.chips?.amount || authState.memberDetails?.account?.chips?.amount === '0.00'}">
                {{ authState.memberDetails?.account?.chips?.currency || 'MYR' }} 
                {{ isBalanceHidden ? '******' : (authState.memberDetails?.account?.chips?.amount || '0.00') }}
              </p>
            </div>
          </div>
        </div>

        <!-- Gateway Deposit (New API) -->
        <div v-if="depositMethod === 'gateway'" class="bg-white p-4 rounded-lg shadow-md mb-8">
          <div class="flex items-center mb-4">
            <div class="bg-green-100 p-2 rounded-full mr-3">
              <i class="fas fa-credit-card text-green-500"></i>
            </div>
            <h3 class="text-xl font-semibold">Gateway Deposit</h3>
          </div>
          <GatewayDeposit />
        </div>

        <!-- Manual Deposit Instructions -->
        <div v-if="depositMethod === 'manual'" class="bg-white p-4 rounded-lg shadow-md mb-8">
          <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-info-circle text-blue-500 mr-2"></i>
            Manual Deposit Instructions
          </h3>
          
          <div class="space-y-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-semibold text-blue-800 mb-2">Step 1: Select Bank & Bonus</h4>
              <p class="text-blue-700 text-sm">
                Choose your preferred bank account and bonus option from the dropdown menus below.
              </p>
            </div>
            
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-semibold text-green-800 mb-2">Step 2: Enter Amount & Upload Receipt</h4>
              <p class="text-green-700 text-sm">
                Fill in the deposit amount and upload your transaction receipt as proof of payment.
              </p>
            </div>
            
            <div class="bg-purple-50 p-4 rounded-lg">
              <h4 class="font-semibold text-purple-800 mb-2">Step 3: Submit & Wait for Approval</h4>
              <p class="text-purple-700 text-sm">
                Submit your deposit request and wait for our team to verify and approve within 24 hours.
              </p>
            </div>
          </div>
        </div>

        <!-- API Diagnostics section - only shows when there are api issues -->
        <div v-if="showDiagnostics" class="bg-white p-4 rounded-lg shadow-md mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-red-600">API Connection Issues</h3>
            <button @click="showDiagnostics = false" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <p class="mb-4 text-gray-700">
            There seems to be an issue connecting to our payment API. Use the diagnostics 
            tool below to help fix the problem.
          </p>
          <ApiDiagnostics />
        </div>

        <!-- Deposit Method Section Hidden -->

        <!-- Deposit Form (Manual) -->
        <div v-if="depositMethod === 'manual'" class="bg-white p-4 rounded-lg shadow-md mb-8">
          <h3 class="text-xl font-semibold mb-6">Deposit Details</h3>

          <!-- Bank Selection (for Manual Deposit) -->
          <div v-if="depositMethod === 'manual'" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Select Bank Account <span class="text-red-500">*</span>
            </label>
            
            <!-- Bank Cards Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              <div 
                v-for="bank in availableBanks" 
                :key="bank.id"
                @click="selectedBank = bank.id"
                :class="[
                  'relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md',
                  selectedBank === bank.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <!-- Bank Logo -->
                <div class="flex flex-col items-center text-center">
                  <div class="w-12 h-12 mb-2 bg-white rounded-lg shadow-sm flex items-center justify-center border">
                    <img 
                      :src="getBankLogo(bank.name)" 
                      :alt="bank.name"
                      class="w-8 h-8 object-contain"
                      @error="handleImageError"
                    />
                  </div>
                  <h4 class="text-sm font-medium text-gray-800 mb-1">{{ bank.name }}</h4>
                  <p class="text-xs text-gray-500">{{ bank.code }}</p>
                </div>
                
                <!-- Selected Indicator -->
                <div 
                  v-if="selectedBank === bank.id"
                  class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <i class="fas fa-check text-white text-xs"></i>
                </div>
              </div>
            </div>
            
            <!-- Selected Bank Details -->
            <div v-if="selectedBank && getSelectedBankDetails()" class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center border">
                  <img 
                    :src="getBankLogo(getSelectedBankDetails()?.name || '')" 
                    :alt="getSelectedBankDetails()?.name || 'Bank'"
                    class="w-6 h-6 object-contain"
                    @error="handleImageError"
                  />
                </div>
                <div>
                  <h4 class="font-medium text-blue-800">{{ getSelectedBankDetails()?.name }}</h4>
                  <p class="text-sm text-blue-600">Bank Code: {{ getSelectedBankDetails()?.code }}</p>
                  <p class="text-xs text-blue-500 mt-1">Transfer your deposit to this bank account</p>
                </div>
              </div>
            </div>
            
            <p class="text-xs text-gray-500 mt-2">
              Select the bank you will use to transfer your deposit
            </p>
          </div>

          <!-- Bonus Selection (moved to top) -->
          <div v-if="depositMethod === 'manual'" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Bonus <span class="text-red-500">*</span>
            </label>
            <select
              v-model="selectedIncentive"
              class="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a bonus option</option>
              <option v-for="incentive in incentives" :key="incentive.id" :value="incentive.id">
                {{ incentive.name }}
                <span v-if="incentive.percentage > 0">({{ incentive.percentage }}% bonus)</span>
                <span v-if="incentive.description"> - {{ incentive.description }}</span>
              </option>
            </select>
            <div v-if="selectedIncentive && getSelectedIncentiveDetails()" class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center text-green-700">
                <i class="fas fa-gift mr-2"></i>
                <span class="font-medium">{{ getSelectedIncentiveDetails() ? getSelectedIncentiveDetails()!.name : '' }}</span>
              </div>
              <p class="text-sm text-green-600 mt-1">
                {{ getSelectedIncentiveDetails() ? getSelectedIncentiveDetails()!.description : '' }}
              </p>
              <p v-if="getSelectedIncentiveDetails() && getSelectedIncentiveDetails()!.percentage > 0" class="text-sm text-green-600 mt-1">
                You will receive {{ getSelectedIncentiveDetails()!.percentage }}% bonus on your deposit
              </p>
            </div>
          </div>
          
          <!-- Amount Input -->
      <div v-if="depositMethod === 'manual'" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Deposit Amount <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                {{ (authState.memberDetails && authState.memberDetails.account && authState.memberDetails.account.cash && authState.memberDetails.account.cash.currency) ? authState.memberDetails.account.cash.currency : 'MYR' }}
              </span>
              <input 
                type="number" 
                v-model="amount" 
                step="0.01"
                min="10"
                max="100000"
                class="w-full p-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter amount"
                required
              />
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <button 
                v-for="quickAmount in quickAmounts" 
                :key="quickAmount"
                @click="amount = quickAmount"
                type="button"
                class="bg-gray-100 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
              >
                {{ (authState.memberDetails && authState.memberDetails.account && authState.memberDetails.account.cash && authState.memberDetails.account.cash.currency) ? authState.memberDetails.account.cash.currency : 'MYR' }} {{ quickAmount }}
              </button>
            </div>
      <div v-if="depositMethod === 'manual'" class="mt-3 text-sm text-gray-500">
              <p>Min deposit: {{ (authState.memberDetails && authState.memberDetails.account && authState.memberDetails.account.cash && authState.memberDetails.account.cash.currency) ? authState.memberDetails.account.cash.currency : 'MYR' }} {{ minDeposit }}</p>
              <p>Max deposit: {{ (authState.memberDetails && authState.memberDetails.account && authState.memberDetails.account.cash && authState.memberDetails.account.cash.currency) ? authState.memberDetails.account.cash.currency : 'MYR' }} {{ maxDeposit }}</p>
            </div>
            
            <!-- Bonus Calculation Display -->
            <div v-if="depositMethod === 'manual' && selectedIncentive && getSelectedIncentiveDetails() && getSelectedIncentiveDetails()!.percentage > 0" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="text-sm">
                <div class="flex justify-between">
                  <span>Deposit Amount:</span>
                  <span class="font-medium">{{ (authState.memberDetails && authState.memberDetails.account && authState.memberDetails.account.cash && authState.memberDetails.account.cash.currency) ? authState.memberDetails.account.cash.currency : 'MYR' }} {{ amount.toFixed(2) }}</span>
          </div>
                <div class="flex justify-between text-green-600">
                  <span>Bonus ({{ getSelectedIncentiveDetails()?.percentage }}%):</span>
                  <span class="font-medium">{{ (authState.memberDetails && authState.memberDetails.account && authState.memberDetails.account.cash && authState.memberDetails.account.cash.currency) ? authState.memberDetails.account.cash.currency : 'MYR' }} {{ (amount * (getSelectedIncentiveDetails() ? getSelectedIncentiveDetails()!.percentage : 0) / 100).toFixed(2) }}</span>
        </div>
                <div class="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total Credit:</span>
                  <span class="text-green-600">{{ (authState.memberDetails && authState.memberDetails.account && authState.memberDetails.account.cash && authState.memberDetails.account.cash.currency) ? authState.memberDetails.account.cash.currency : 'MYR' }} {{ (amount + (amount * (getSelectedIncentiveDetails() ? getSelectedIncentiveDetails()!.percentage : 0) / 100)).toFixed(2) }}</span>
            </div>
              </div>
            </div>
          </div>
          
          <!-- Transaction Receipt Upload (for Manual Deposit) -->
          <div v-if="depositMethod === 'manual'" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Transaction Receipt <span class="text-red-500">*</span>
            </label>
            <div class="file-upload-area border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input 
                ref="fileInput"
                type="file" 
                @change="handleFileUpload" 
                accept="image/*,.pdf"
                class="hidden"
                required
              />
              <div v-if="!uploadedFile" @click="triggerFileSelect" class="cursor-pointer">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-600 mb-2">Click to upload transaction receipt</p>
                <p class="text-sm text-gray-500">Supports: JPG, PNG, PDF (Max 5MB)</p>
          </div>
              <div v-else class="space-y-3">
                <div class="flex items-center justify-center space-x-3">
                  <i class="fas fa-file-alt text-2xl text-green-500"></i>
                  <div>
                    <p class="font-medium text-gray-700">{{ uploadedFile.name }}</p>
                    <p class="text-sm text-gray-500">{{ (uploadedFile.size / 1024 / 1024).toFixed(2) }} MB</p>
            </div>
          </div>
                <div class="flex space-x-2">
                  <button 
                    @click="triggerFileSelect" 
                    type="button"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Change File
                  </button>
                  <button 
                    @click="uploadedFile = null" 
                    type="button"
                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                  >
                    Remove
                  </button>
            </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Please upload a clear image or PDF of your bank transfer receipt
            </p>
    </div>
          
          <!-- Remarks Section -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Remarks <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="remarks" 
              required
              class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              placeholder="Enter deposit reference number or additional information..."
              rows="3"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              Please provide transaction reference number or additional information about your deposit
            </p>
    </div>
      </div>

        <!-- Diagnostic Tool -->
        <deposit-diagnostics v-if="showDiagnostics" />
        
        <!-- Submit Button -->
        <div class="bg-white p-4 rounded-lg shadow-md">
        <div class="flex justify-end">
          <button 
            @click="submitDeposit" 
            :disabled="!isFormValid || isLoading"
              :class="['px-8 py-3 rounded-lg font-semibold transition-all duration-200', 
                      isFormValid && !isLoading ? 'bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed']"
          >
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin mr-2"></i>Processing...
            </span>
              <span v-else>
                Submit Manual Deposit
              </span>
          </button>
          </div>
    </div>
      </div>
    </member-center-2>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { authState } from '@/store/auth';
import Swal from 'sweetalert2';
import MemberCenter2 from './MemberCenter2.vue';
import { laravelApi as api } from '@/services/laravelApi';
import { BANK_IDS } from '@/utils/reference-ids';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import ApiDiagnostics from '@/components/ApiDiagnostics.vue';
import DepositDiagnostics from '@/components/DepositDiagnostics.vue';
import GatewayDeposit from '@/components/GatewayDeposit.vue';

interface IncentiveOption {
  id: number;
  name: string;
  percentage: number;
  description?: string;
  type?: number;
  events?: string[];
}

export default defineComponent({
  name: 'DepositPage',
  components: {
    MemberCenter2,
    ApiDiagnostics,
    DepositDiagnostics,
    GatewayDeposit
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const isLoading = ref(false);
    const isBalanceHidden = ref(true);
    const depositMethod = ref<'gateway' | 'manual'>('gateway');
    const amount = ref(50);
    const referenceNumber = ref('');
    const uploadedFile = ref<File | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);
    const selectedBank = ref('');
    const remarks = ref('');
    const availableBanks = ref<any[]>([]);
    const bankDetails = ref<any>(null);
    const systemBankAccounts = ref<any[]>([]);
    
    // Bank data based on API
    const bankList = [
      { id: 12, name: 'Affin Bank', code: 'AFFIN' },
      { id: 13, name: 'Agro Bank', code: 'AGRO' },
      { id: 14, name: 'Alliance Bank', code: 'ALLIANCE' },
      { id: 15, name: 'AmBank', code: 'AMBANK' },
      { id: 16, name: 'Bank Islam', code: 'ISLAM' },
      { id: 17, name: 'Bank Rakyat', code: 'RAKYAT' },
      { id: 18, name: 'Bank Simpanan National (BSN)', code: 'BSN' },
      { id: 19, name: 'CIMB', code: 'CIMB' },
      { id: 20, name: 'Citibank', code: 'CITI' },
      { id: 21, name: 'Hong Leong Bank', code: 'HLB' },
      { id: 22, name: 'HSBC Bank', code: 'HSBC' },
      { id: 23, name: 'Maybank', code: 'MAYBANK' },
      { id: 24, name: 'OCBC', code: 'OCBC' },
      { id: 25, name: 'Public Bank', code: 'PUBLIC' },
      { id: 26, name: 'RHB Bank', code: 'RHB' },
      { id: 27, name: 'Standard Chartered Bank', code: 'SCB' },
      { id: 28, name: 'UOB', code: 'UOB' },
      { id: 31, name: 'Bank Muamalat', code: 'MUAMALAT' }
    ];
    const showDiagnostics = ref(false);
    const selectedIncentive = ref<number | null>(null);
    
    // Incentive options for manual deposit
    const incentives = ref<IncentiveOption[]>([]);
    const loadingIncentives = ref(false);
    
    // Min and max deposit amount
    const minDeposit = 10;
    const maxDeposit = 100000;

    const quickAmounts = [50, 100, 500, 1000, 5000];

    const paymentMethods = [
      { id: 'bank', name: 'Bank Transfer', icon: 'fas fa-university text-blue-500' },
      { id: 'usdt', name: 'USDT', icon: 'fas fa-coins text-green-500' },
      { id: 'ezpay', name: 'EZ Pay', icon: 'fas fa-credit-card text-purple-500' },
      { id: 'tng', name: 'Touch n Go', icon: 'fas fa-mobile-alt text-orange-500' }
    ];

    const toggleBalanceVisibility = () => {
      isBalanceHidden.value = !isBalanceHidden.value;
    };

    const selectPaymentMethod = (method: string) => {
      depositMethod.value = method === 'manual' ? 'manual' : 'gateway';
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      Swal.fire({
        icon: 'success',
        title: 'Copied!',
        text: 'Text copied to clipboard',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      });
    };

    const handleFileUpload = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          Swal.fire({
            icon: 'error',
            title: 'File Too Large',
            text: 'Please select a file smaller than 5MB.',
            confirmButtonColor: '#3B82F6'
          });
          // Clear the file input
          if (fileInput.value) {
            (fileInput.value as HTMLInputElement).value = '';
          }
          return;
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid File Type',
            text: 'Please select a JPG, PNG, or PDF file.',
            confirmButtonColor: '#3B82F6'
          });
          // Clear the file input
          if (fileInput.value) {
            (fileInput.value as HTMLInputElement).value = '';
          }
          return;
        }
        
        uploadedFile.value = file;
      }
    };

    const triggerFileSelect = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    const isFormValid = computed(() => {
      if (amount.value < minDeposit) return false;
      
      if (amount.value > maxDeposit) return false;
      
      // Only manual deposit validation needed
      return selectedIncentive.value !== null && 
             remarks.value.trim() !== '' && 
             selectedBank.value !== '' &&
             uploadedFile.value !== null;
    });

    const getSelectedIncentiveDetails = (): IncentiveOption | null => {
      if (!selectedIncentive.value) return null;
      return incentives.value.find(incentive => incentive.id === selectedIncentive.value) || null;
    };

    const getSelectedBankDetails = (): { id: number | string; name: string; code: string } | null => {
      if (!selectedBank.value) return null;
      return availableBanks.value.find(bank => bank.id === selectedBank.value);
    };

    const getBankLogo = (bankName: string) => {
      // Use a local generic icon for now to avoid external calls
      return '/favicon.ico';
    };

    const handleImageError = (event: any) => {
      // Fallback to a generic bank icon if image fails to load
      event.target.src = '/favicon.ico';
    };

    const submitDeposit = async () => {
      if (!isFormValid.value) return;
      
      try {
        isLoading.value = true;
        
        Swal.fire({
          title: 'Processing...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Get selected bank details for remarks
        const selectedBankDetails = getSelectedBankDetails();
        const bankInfo = selectedBankDetails ? `Bank: ${selectedBankDetails.name} (${selectedBankDetails.code})` : '';
        const fileInfo = uploadedFile.value ? `Receipt: ${uploadedFile.value.name}` : '';
        
        // Combine all information in remarks
        const combinedRemarks = [
          remarks.value || 'Manual deposit request',
          bankInfo,
          fileInfo
        ].filter(Boolean).join(' | ');
        
        // Deposit parameters
        const depositParams = {
          amount: amount.value,
          incentiveid: selectedIncentive.value || 1, // Default to 1 if null
          remarks: combinedRemarks
        };
        
        try {
          // Process via manual deposit API (only option)
          const response = await api.depositManual(depositParams);
          
          console.log('Manual deposit result:', response);
          
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Deposit Submitted',
            text: 'Your manual deposit request has been submitted for approval.',
            confirmButtonColor: '#3B82F6'
          });
          
          // Reset form
          amount.value = 50;
          remarks.value = '';
          selectedIncentive.value = null;
          selectedBank.value = '';
          uploadedFile.value = null;
          if (fileInput.value) {
            (fileInput.value as HTMLInputElement).value = '';
          }
        } catch (apiError: any) {
          console.error('API error during deposit:', apiError);
          
          // Check for specific connection issues
          const errorMessage = apiError.message || '';
          
          // Show API diagnostics if it appears to be an API connection issue
          if (errorMessage.includes('Failed to fetch') || 
              errorMessage.includes('Network Error') ||
              errorMessage.includes('CORS') ||
              errorMessage.includes('HTML error page') ||
              errorMessage.includes('522') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('gateway')) {
            
            showDiagnostics.value = true;
            
            // Use different messages based on error type
            let title = 'API Connection Issue';
            let text = 'There seems to be a problem connecting to our payment API.';
            
            if (errorMessage.includes('522') || errorMessage.includes('timeout')) {
              title = 'Connection Timeout (Error 522)';
              text = 'The connection to our payment server timed out. This is often a temporary issue.';
            } else if (errorMessage.includes('gateway')) {
              title = 'Payment Gateway Issue';
              text = 'There was a problem connecting to the payment gateway.';
            }
            
            Swal.fire({
              icon: 'error',
              title: title,
              html: `
                <p>${text}</p>
                <p class="mt-3">Please try one of the following:</p>
                <ul class="text-left mt-2 mx-auto" style="max-width: 300px;">
                  <li>• Use the diagnostics tool below to resolve the issue</li>
                  <li>• Refresh the page and try again</li>
                  <li>• Try a different network connection</li>
                </ul>
              `,
              confirmButtonColor: '#3B82F6'
            });
          } else {
            // Regular error message for other types of errors
            Swal.fire({
              icon: 'error',
              title: 'Deposit Failed',
              text: apiError.message || 'There was an error processing your deposit. Please try again.',
              confirmButtonColor: '#3B82F6'
            });
          }
        }
      } catch (error) {
        console.error('Deposit error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Deposit Failed',
          text: 'There was a system error processing your request. Please try again later.',
          confirmButtonColor: '#3B82F6'
        });
      } finally {
        isLoading.value = false;
      }
    };

    // Load incentives from API
    const loadIncentives = async () => {
      try {
        loadingIncentives.value = true;
        const response = await api.getIncentives();
        
        if (response.success && response.data && response.data.system) {
          // Transform API incentives to UI format
          incentives.value = response.data.system
            .filter((incentive: any) => incentive.status === 1) // Only active incentives
            .map((incentive: any) => {
              let percentage = 0;
              
              // Try to extract percentage from decoded data
              if (incentive.decodedData && incentive.decodedData.rate !== undefined) {
                percentage = incentive.decodedData.rate;
              }
              
              return {
                id: incentive.iid,
                name: incentive.name,
                percentage: percentage,
                description: incentive.description || '',
                type: incentive.type,
                events: incentive.events || []
              };
            });
          
          // Add "No Bonus" option
          incentives.value.push({
            id: 0,
            name: 'No Bonus',
            percentage: 0,
            description: 'Proceed without any bonus',
            type: 0,
            events: []
          });
          
          console.log('✅ Loaded incentives:', incentives.value);
        } else {
          // Fallback to default incentives if API fails
          console.log('Using fallback incentives');
          incentives.value = [
            { id: 1, name: 'Welcome Bonus', percentage: 100, description: 'First deposit bonus' },
            { id: 2, name: 'Reload Bonus', percentage: 50, description: 'Reload bonus for existing players' },
            { id: 0, name: 'No Bonus', percentage: 0, description: 'Proceed without any bonus' }
          ];
        }
      } catch (error) {
        console.error('Failed to load incentives:', error);
        // Use fallback incentives
        incentives.value = [
          { id: 1, name: 'Welcome Bonus', percentage: 100, description: 'First deposit bonus' },
          { id: 2, name: 'Reload Bonus', percentage: 50, description: 'Reload bonus for existing players' },
          { id: 0, name: 'No Bonus', percentage: 0, description: 'Proceed without any bonus' }
        ];
      } finally {
        loadingIncentives.value = false;
      }
    };

    onMounted(async () => {
      try {
        isLoading.value = true;
        
        // Load incentives (parallel with other data)
        const incentivesPromise = loadIncentives();
        
        // Initialize available banks with the bank list
        availableBanks.value = bankList;
        
        // Get member's bank accounts (if needed for additional data)
        try {
          const memberDetails = await api.getMemberDetails();
          if (memberDetails && (memberDetails as any).banks) {
            // You can merge or use member's bank data if needed
            console.log('Member bank accounts:', (memberDetails as any).banks);
          }
        } catch (memberError) {
          console.log('Failed to load member details:', memberError);
        }
        
        // Get system bank accounts (if needed for additional data)
        try {
          const systemBanks = await api.getSystemBankAccounts();
          systemBankAccounts.value = (systemBanks as any)?.data || [];
          console.log('System bank accounts:', systemBanks);
        } catch (bankError) {
          console.log('Failed to load system bank accounts:', bankError);
        }
        
        // Wait for incentives to load
        await incentivesPromise;
        
      } catch (error) {
        console.error('Error initializing deposit form:', error);
        toast.error('There was an error loading your account details. Please try again later.');
      } finally {
        isLoading.value = false;
      }
    });

    return {
      authState,
      isLoading,
      isBalanceHidden,
      toggleBalanceVisibility,
      depositMethod,
      paymentMethods,
      selectPaymentMethod,
      amount,
      quickAmounts,
      referenceNumber,
      uploadedFile,
      fileInput,
      copyToClipboard,
      handleFileUpload,
      triggerFileSelect,
      isFormValid,
      submitDeposit,
      selectedBank,
      remarks,
      availableBanks,
      bankDetails,
      systemBankAccounts,
      minDeposit,
      maxDeposit,
      BANK_IDS,
      showDiagnostics,
      selectedIncentive,
      incentives,
      loadingIncentives,
      loadIncentives,
      getSelectedIncentiveDetails,
      getSelectedBankDetails,
      getBankLogo,
      handleImageError,
      bankList
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

/* Bank card hover effects */
.bank-card {
  transition: all 0.2s ease-in-out;
}

.bank-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bank-card.selected {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

/* File upload area styling */
.file-upload-area {
  transition: all 0.2s ease-in-out;
}

.file-upload-area:hover {
  border-color: #3B82F6;
  background-color: #F8FAFC;
}
</style>
