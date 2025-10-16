<template>
  <div>
    <member-center-2>
      <!-- Withdraw Content -->
      <div class="p-6 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold mb-2">
                <i class="fas fa-arrow-down mr-3"></i>
                Withdraw Funds
              </h2>
              <p class="text-blue-100">Transfer money to your bank account</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-blue-200">Available Balance</p>
              <p class="text-2xl font-bold">
                <span v-if="isBalanceHidden">****</span>
                <span v-else>{{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} {{ cashBalance }}</span>
                <button @click="toggleBalanceVisibility" class="ml-2 text-blue-200 hover:text-white">
              <i :class="isBalanceHidden ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </button>
              </p>
            </div>
          </div>
        </div>

        <!-- Withdrawal Method Selection -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-exchange-alt mr-2 text-blue-500"></i>
            Withdrawal Method
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="method in withdrawalMethods" 
              :key="method.id"
              :class="['border-2 rounded-lg p-4 cursor-pointer transition-all', 
                      {'border-blue-500 bg-blue-50': selectedWithdrawalMethod === method.id, 'border-gray-200 hover:border-blue-300': selectedWithdrawalMethod !== method.id}]"
              @click="selectWithdrawalMethod(method.id)"
            >
              <div class="text-center">
                <i :class="method.icon + ' text-3xl mb-2'"></i>
                <p class="font-semibold">{{ method.name }}</p>
              </div>
            </div>
          </div>
        </div>
          
        <!-- Amount Selection -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-coins mr-2 text-green-500"></i>
            Withdrawal Amount
          </h3>
          
          <div class="mb-4">
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }}
              </span>
              <input 
                type="number" 
                v-model="amount" 
                class="w-full pl-16 pr-4 py-3 text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                :min="minWithdraw" 
                :max="maxWithdraw"
                placeholder="100"
              />
            </div>
          </div>

          <!-- Quick Amount Buttons -->
          <div class="grid grid-cols-5 gap-2 mb-4">
              <button 
                v-for="quickAmount in quickAmounts" 
                :key="quickAmount"
                @click="amount = quickAmount"
              class="py-2 px-3 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg font-medium transition-colors"
              >
                {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} {{ quickAmount }}
              </button>
            </div>

          <div class="flex justify-between text-sm text-gray-600">
            <span>Min withdrawal: {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} {{ minWithdraw }}</span>
            <span>Max withdrawal: {{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} {{ maxWithdraw.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Bank Account Selection -->
        <div v-if="selectedWithdrawalMethod === 'bank'" class="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-university mr-2 text-blue-500"></i>
            Your Bank Account
          </h3>
          
          <div v-if="bankAccounts.length > 0">
            <div class="space-y-3 mb-4">
                <div 
                  v-for="(account, index) in bankAccounts" 
                  :key="index"
                :class="['border-2 rounded-lg p-4 cursor-pointer transition-all', 
                        {'border-blue-500 bg-blue-50': selectedBank === (account.iid || index), 'border-gray-200 hover:border-gray-300': selectedBank !== (account.iid || index)}]"
                @click="selectedBank = account.iid || index"
                >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="bg-blue-100 p-3 rounded-full">
                      <i class="fas fa-university text-blue-600 text-xl"></i>
                    </div>
                    <div>
                      <h4 class="font-semibold text-lg text-gray-800">{{ getBankDisplayName(account) }}</h4>
                      <p class="text-gray-600">{{ getAccountHolderName(account) }}</p>
                      <p class="text-gray-500 font-mono text-sm">{{ formatAccountNumber(account) }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span v-if="account.status === 1" class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      <i class="fas fa-check-circle mr-1"></i>
                      Active
                    </span>
                    <span v-if="index === 0" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      <i class="fas fa-star mr-1"></i>
                      Primary
                    </span>
                    <i v-if="selectedBank === (account.iid || index)" class="fas fa-check-circle text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Add Bank Account Button -->
            <button 
              @click="showAddBankForm = true"
              class="w-full border-2 border-dashed border-blue-300 rounded-lg p-4 text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <i class="fas fa-plus mr-2"></i>
              Add Another Bank Account
            </button>
          </div>
          
          <div v-else class="text-center py-8">
            <div class="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-university text-gray-400 text-2xl"></i>
            </div>
            <h4 class="text-lg font-semibold text-gray-700 mb-2">No Bank Account</h4>
            <p class="text-gray-500 mb-4">Add your bank account to receive withdrawals</p>
            <button 
              @click="showAddBankForm = true"
              class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-plus mr-2"></i>
              Add Bank Account
            </button>
          </div>
        </div>

        <!-- USDT Withdrawal (if selected) -->
        <div v-if="selectedWithdrawalMethod === 'usdt'" class="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-coins mr-2 text-green-500"></i>
            USDT Wallet Details
          </h3>
          
          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Network Protocol</label>
            <select 
              v-model="networkProtocol" 
              class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            >
              <option value="trc20">Tron (TRC20) - Recommended</option>
              <option value="erc20">Ethereum (ERC20)</option>
              <option value="bep20">Binance Smart Chain (BEP20)</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">USDT Wallet Address</label>
            <input 
              type="text" 
              v-model="usdtAddress" 
              placeholder="Enter your USDT wallet address" 
              class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Withdrawal Summary -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 class="text-xl font-semibold mb-4">
            <i class="fas fa-receipt mr-2 text-green-500"></i>
            Withdrawal Summary
          </h3>
          
          <div class="space-y-3 mb-4">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-gray-600">Method</span>
              <span class="font-semibold">{{ getMethodName }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-gray-600">Amount</span>
              <span class="font-semibold">{{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} {{ amount }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-gray-600">Processing Fee</span>
              <span class="font-semibold">{{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} {{ fee }}</span>
            </div>
            <div class="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
              <span class="text-green-800 font-semibold text-lg">You will receive</span>
              <span class="text-green-800 font-bold text-xl">{{ authState.memberDetails?.account?.cash?.currency || 'MYR' }} {{ (amount - fee).toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex items-center">
              <i class="fas fa-clock text-blue-600 mr-2"></i>
              <span class="text-blue-800 font-medium">Processing time: 1-24 hours</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="text-center">
          <button 
            @click="submitWithdrawal" 
            :disabled="!isFormValid || isLoading"
            :class="[
              'px-8 py-4 rounded-lg font-bold text-lg transition-all',
              isFormValid && !isLoading 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transform hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            ]"
          >
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Processing...
            </span>
            <span v-else>
              <i class="fas fa-paper-plane mr-2"></i>
            Submit Withdrawal Request
            </span>
          </button>
        </div>
      </div>
    </member-center-2>

    <!-- Add Bank Account Modal -->
    <div 
      v-if="showAddBankForm" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-800">
                <i class="fas fa-university mr-2 text-blue-600"></i>
                Add Bank Account
              </h3>
              <p class="text-gray-600 mt-1">Add your personal bank account for withdrawals</p>
            </div>
            <button @click="showAddBankForm = false" class="text-gray-400 hover:text-gray-600 text-xl">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
            <div class="flex items-start">
              <i class="fas fa-exclamation-triangle text-amber-600 mr-2 mt-0.5"></i>
              <div class="text-amber-800 text-sm">
                <p class="font-medium">Important:</p>
                <p>Make sure the account holder name exactly matches your registered name for successful withdrawals.</p>
              </div>
            </div>
          </div>
          
          <form @submit.prevent="handleAddBank" class="space-y-6">
            <!-- Bank Selection -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">
                <i class="fas fa-building mr-2 text-blue-600"></i>
                Select Your Bank
              </label>
              <select 
                v-model="newBank.bankid" 
                class="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                required
              >
                <option disabled value="">Choose your bank</option>
                <option 
                  v-for="(bank, index) in availableBanks" 
                  :key="index" 
                  :value="bank.id"
                >
                  {{ bank.name }}
                </option>
              </select>
            </div>
            
            <!-- Account Holder Name -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">
                <i class="fas fa-user mr-2 text-blue-600"></i>
                Account Holder Name
              </label>
              <input 
                v-model="newBank.name" 
                type="text" 
                class="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                placeholder="Enter your full name as registered with the bank"
                required
              />
              <p class="mt-2 text-xs text-gray-500">
                <i class="fas fa-info-circle mr-1"></i>
                Must exactly match your bank account registration
              </p>
            </div>
            
            <!-- Account Number -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">
                <i class="fas fa-hashtag mr-2 text-blue-600"></i>
                Account Number
              </label>
              <input 
                v-model="newBank.accountnumber" 
                type="text" 
                class="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" 
                placeholder="Enter your account number"
                required
              />
              <p class="mt-2 text-xs text-gray-500">
                <i class="fas fa-shield-alt mr-1"></i>
                Your account information is encrypted and secure
              </p>
            </div>
            
            <div class="flex justify-end space-x-4 pt-4">
              <button 
                type="button"
                @click="showAddBankForm = false" 
                class="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
                :disabled="isLoading"
              >
                <span v-if="isLoading">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Adding...
                </span>
                <span v-else>
                  <i class="fas fa-plus mr-2"></i>
                  Add Bank Account
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { authState } from '@/store/auth';
import { laravelApi as api } from '@/services/laravelApi';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import MemberCenter2 from './MemberCenter2.vue';
import { BANK_IDS } from '@/utils/reference-ids';

export default defineComponent({
  name: 'WithdrawPage',
  components: {
    MemberCenter2
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const isLoading = ref(false);
    const isBalanceHidden = ref(true);
    const selectedWithdrawalMethod = ref('bank');
    const amount = ref(100);
    const fee = ref(0);
    const selectedBank = ref('');
    const bankAccounts = ref<any[]>([]);
    const showAddBankForm = ref(false);
    const cashBalance = ref('0.00');
    const networkProtocol = ref('trc20');
    const usdtAddress = ref('');

    const quickAmounts = [50, 100, 500, 1000, 5000];

    const withdrawalMethods = [
      { id: 'bank', name: 'Bank Transfer', icon: 'fas fa-university text-blue-500' },
      { id: 'usdt', name: 'USDT', icon: 'fas fa-coins text-green-500' },
    ];

    // Min and max withdraw amount
    const minWithdraw = 50;
    const maxWithdraw = 50000;
    
    // Available banks (from reference-ids)
    const availableBanks = [
      { id: BANK_IDS.MAYBANK, name: 'Maybank' },
      { id: BANK_IDS.CIMB, name: 'CIMB Bank' },
      { id: BANK_IDS.PUBLIC_BANK, name: 'Public Bank' },
      { id: BANK_IDS.RHB_BANK, name: 'RHB Bank' },
      { id: BANK_IDS.HONG_LEONG_BANK, name: 'Hong Leong Bank' },
      { id: BANK_IDS.AMBANK, name: 'AmBank' },
      { id: BANK_IDS.UOB, name: 'UOB Bank' },
      { id: BANK_IDS.OCBC, name: 'OCBC Bank' },
      { id: BANK_IDS.STANDARD_CHARTERED_BANK, name: 'Standard Chartered' },
      { id: BANK_IDS.HSBC_BANK, name: 'HSBC Bank' },
      { id: BANK_IDS.AFFIN_BANK, name: 'Affin Bank' },
      { id: BANK_IDS.ALLIANCE_BANK, name: 'Alliance Bank' },
      { id: BANK_IDS.BANK_ISLAM, name: 'Bank Islam' },
      { id: BANK_IDS.BANK_RAKYAT, name: 'Bank Rakyat' },
      { id: BANK_IDS.BSN, name: 'BSN' }
    ];
    
    // New bank account form
    const newBank = ref({
      bankid: '',
      name: '',
      accountnumber: ''
    });

    // Load user data
    onMounted(async () => {
      try {
        isLoading.value = true;
        
        // Load bank accounts and balance
        const memberDetails = await api.getMemberDetails();
        if (memberDetails) {
          if (memberDetails.banks) {
            bankAccounts.value = memberDetails.banks;
            if (bankAccounts.value.length > 0) {
              selectedBank.value = bankAccounts.value[0].iid || 0;
            }
          }
          
          if (memberDetails.account && memberDetails.account.cash) {
            cashBalance.value = memberDetails.account.cash.amount;
          }
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        toast.error('Failed to load bank accounts');
      } finally {
        isLoading.value = false;
      }
    });

    const toggleBalanceVisibility = () => {
      isBalanceHidden.value = !isBalanceHidden.value;
    };

    const selectWithdrawalMethod = (method: string) => {
      selectedWithdrawalMethod.value = method;
    };

    // Calculate fee (example logic)
    const calculateFee = (amount: number): number => {
      // Free for first withdrawal of the day
      return 0;
      // Otherwise could be something like:
      // return Math.min(Math.max(amount * 0.01, 1), 50); // 1% with min 1, max 50
    };

    // Update fee whenever amount changes
    const updateFee = () => {
      fee.value = calculateFee(amount.value);
    };

    // Watch for amount changes
    // In a real implementation, you'd use watch() here

    // Computed property for method name display
    const getMethodName = computed(() => {
      if (selectedWithdrawalMethod.value === 'bank') {
        if (selectedBank.value !== null && bankAccounts.value.length > 0) {
          const account = bankAccounts.value.find(a => (a.iid || bankAccounts.value.indexOf(a)) === selectedBank.value);
          if (account) {
            return `Bank Transfer (${getBankDisplayName(account)})`;
          }
        }
        return 'Bank Transfer';
      } else if (selectedWithdrawalMethod.value === 'usdt') {
        return `USDT (${networkProtocol.value.toUpperCase()})`;
      }
      return '';
    });

    const isFormValid = computed(() => {
      if (amount.value < minWithdraw) return false;
      
      if (amount.value > maxWithdraw) return false;
      
      if (selectedWithdrawalMethod.value === 'bank') {
        return selectedBank.value && bankAccounts.value.length > 0;
      } else if (selectedWithdrawalMethod.value === 'usdt') {
        // Simple validation for USDT address length
        return usdtAddress.value.length >= 30;
      }
      
      return false;
    });

    const submitWithdrawal = async () => {
      if (!isFormValid.value) {
        toast.error('Please complete all required fields');
        return;
      }
      
      try {
        isLoading.value = true;
        
        Swal.fire({
          title: 'Processing Withdrawal...',
          text: 'Please wait while we process your withdrawal request',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Process withdrawal based on method
        if (selectedWithdrawalMethod.value === 'bank') {
          const response = await api.withdraw(amount.value, parseInt(selectedBank.value));
        
          if (response && response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Withdrawal Submitted',
              text: 'Your withdrawal request has been submitted successfully and is pending approval.',
              confirmButtonColor: '#3B82F6'
            });
            
            // Reset form
            amount.value = 100;
            
            // Redirect to wallet after delay
            setTimeout(() => {
            router.push('/wallet');
            }, 2000);
          } else {
            throw new Error(response.message || 'Withdrawal failed');
          }
        } else {
          throw new Error('USDT withdrawal not implemented yet');
        }
      } catch (error: any) {
        console.error('Withdrawal error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Withdrawal Failed',
          text: error.message || 'Failed to process withdrawal. Please try again.',
          confirmButtonColor: '#3B82F6'
        });
      } finally {
        isLoading.value = false;
      }
    };

    const handleAddBank = async () => {
      try {
        isLoading.value = true;
        
        // Validate form
        if (!newBank.value.bankid || !newBank.value.name || !newBank.value.accountnumber) {
          toast.error('Please fill in all required fields');
          return;
        }
        
        // Process bank account creation
        const response = await api.createBankAccount({
          bankid: parseInt(newBank.value.bankid),
          name: newBank.value.name,
          accountnumber: newBank.value.accountnumber
        });
        
        if (response && response.success) {
          toast.success('Bank account added successfully');
          showAddBankForm.value = false;
          
          // Reset form
          newBank.value = {
            bankid: '',
            name: '',
            accountnumber: ''
          };
          
          // Refresh bank accounts
          await loadBankAccounts();
        } else {
          toast.error('Failed to add bank account: ' + (response.message || 'Unknown error'));
        }
      } catch (error: any) {
        console.error('Bank account creation error:', error);
        toast.error('Failed to add bank account: ' + (error.message || 'Unknown error'));
      } finally {
        isLoading.value = false;
      }
    };

    const loadBankAccounts = async () => {
      try {
        isLoading.value = true;
        
        // Load bank accounts
        const memberDetails = await api.getMemberDetails();
        if (memberDetails && memberDetails.banks) {
          bankAccounts.value = memberDetails.banks;
          if (bankAccounts.value.length > 0) {
            selectedBank.value = bankAccounts.value[0].iid || 0;
          }
        }
      } catch (error) {
        console.error('Failed to load bank accounts:', error);
        toast.error('Failed to load bank accounts');
      } finally {
        isLoading.value = false;
      }
    };

    // Helper function to get bank display name
    const getBankDisplayName = (account: any): string => {
      // Handle different data structures
      console.log('Account object:', account);
      
      // If it's a string (raw JSON display), try to parse it
      if (typeof account === 'string') {
        try {
          const parsed = JSON.parse(account);
          return parsed.name || 'Bank Account';
        } catch (e) {
          return account;
        }
      }
      
      // Check direct name field (this should work for CIMB Bank case)
      if (account.name && typeof account.name === 'string') {
        return account.name;
      }
      
      // Check if account has bank name
      if (account.bank) return account.bank;
      
      // Try to get bank name from bank ID if available
      if (account.bankid || account.iid) {
        const bankId = account.bankid || account.iid;
        const bank = availableBanks.find(b => b.id === bankId);
        if (bank) return bank.name;
      }
      
      // Try shortname as fallback
      if (account.shortname) {
        return account.shortname.toUpperCase() + ' Bank';
      }
      
      return 'Bank Account';
    };

    // Helper function to format account number for display
    const formatAccountNumber = (account: any): string => {
      // Get account number from various possible fields
      let accountNumber = '';
      
      if (typeof account === 'string') {
        accountNumber = account;
      } else if (account) {
        accountNumber = account.accountnumber || account.number || account.account_number || '';
      }
      
      if (!accountNumber) return 'Account Number Not Available';
      
      // Remove any spaces or special characters
      const cleaned = accountNumber.toString().replace(/\D/g, '');
      
      // If it's a long number, mask middle digits for security
      if (cleaned.length > 8) {
        const start = cleaned.substring(0, 4);
        const end = cleaned.substring(cleaned.length - 4);
        const middle = '*'.repeat(Math.min(cleaned.length - 8, 6));
        return `${start}${middle}${end}`;
      }
      
      // For shorter numbers, just format nicely
      if (cleaned.length > 4) {
        return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
      }
      
      return cleaned;
    };

    // Helper function to get account holder name
    const getAccountHolderName = (account: any): string => {
      console.log('Getting account holder for:', account);
      
      // Look for account holder name fields
      if (account.accountname) return account.accountname;
      if (account.account_name) return account.account_name;
      if (account.holder_name) return account.holder_name;
      if (account.accountholder) return account.accountholder;
      
      // If none found, return a default
      return 'Account Holder';
    };

    // Call updateFee initially
    updateFee();

    return {
      authState,
      isLoading,
      isBalanceHidden,
      toggleBalanceVisibility,
      selectedWithdrawalMethod,
      withdrawalMethods,
      selectWithdrawalMethod,
      amount,
      quickAmounts,
      fee,
      bankAccounts,
      selectedBank,
      showAddBankForm,
      cashBalance,
      minWithdraw,
      maxWithdraw,
      newBank,
      networkProtocol,
      usdtAddress,
      getMethodName,
      isFormValid,
      submitWithdrawal,
      handleAddBank,
      availableBanks,
      getBankDisplayName,
      formatAccountNumber,
      getAccountHolderName
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
select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}
</style>
  