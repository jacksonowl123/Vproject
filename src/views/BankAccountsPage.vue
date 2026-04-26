<template>
  <div>
    <member-center-2>
      <!-- Bank Accounts Content -->
      <div class="p-4 max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-white p-4 rounded-lg shadow-md mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="bg-blue-100 p-2 rounded-full mr-3">
                <i class="fas fa-university text-blue-500"></i>
        </div>
              <h3 class="text-xl font-semibold">Bank Accounts</h3>
            </div>
            <button
              @click="showAddBankForm = true"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              <i class="fas fa-plus mr-2"></i>Add Bank Account
            </button>
          </div>
          <p class="text-gray-600">Manage your bank accounts for withdrawals and deposits</p>
        </div>
          
        <!-- Bank Accounts List -->
        <div class="bg-white p-4 rounded-lg shadow-md mb-8">
          <h3 class="text-xl font-semibold mb-6">Your Bank Accounts</h3>
          
          <div v-if="bankAccounts.length > 0" class="space-y-4">
            <div
              v-for="(account, index) in bankAccounts" 
              :key="account.id || account.iid || account.bank_id || index"
              class="border rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div class="flex justify-between items-start">
                  <div>
                  <div class="flex items-center mb-2">
                    <i class="fas fa-university text-blue-500 mr-2"></i>
                    <h4 class="font-semibold text-lg">{{ getBankName(account) }}</h4>
                    <span v-if="account.isPrimary" class="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Primary
                    </span>
                  </div>
                  <p class="text-gray-600 mb-1">Account Holder: {{ getAccountHolder(account) }}</p>
                  <p class="text-gray-600 font-mono">{{ formatAccountNumber(account) }}</p>
                  <p class="text-xs text-gray-500 mt-2">
                    Added on {{ formatDate(account) }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button 
                    v-if="!account.isPrimary"
                    @click="setPrimaryAccount(account)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Set as Primary
                  </button>
                  <button 
                    @click="removeAccount(account)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
              </div>
            </div>
          </div>
        </div>

          <div v-else class="text-center py-12">
            <i class="fas fa-university text-gray-400 text-5xl mb-4"></i>
            <p class="text-gray-500 mb-4">No bank accounts found</p>
            <button 
              @click="showAddBankForm = true"
              class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              <i class="fas fa-plus mr-2"></i>Add Your First Bank Account
            </button>
          </div>
        </div>

        <!-- Information Card -->
        <div class="bg-blue-50 p-4 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold text-blue-800 mb-3">
            <i class="fas fa-info-circle mr-2"></i>Important Information
          </h3>
          <ul class="text-blue-700 text-sm space-y-2 list-disc pl-5">
            <li>Bank accounts are required for withdrawal requests</li>
            <li>Account holder name must match your registered name</li>
            <li>Primary account will be used as default for withdrawals</li>
            <li>All bank accounts are verified for security purposes</li>
            <li>Processing time for withdrawals: 1-24 hours</li>
          </ul>
        </div>
      </div>
    </member-center-2>

    <!-- Add Bank Account Modal -->
    <div 
      v-if="showAddBankForm" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold">Add Bank Account</h3>
            <button @click="showAddBankForm = false" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <form @submit.prevent="handleAddBank">
            <!-- Bank Selection -->
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="bank-select">
                Select Bank <span class="text-red-500">*</span>
              </label>
              <select 
                id="bank-select" 
                v-model="newBank.bank" 
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a bank</option>
                <option 
                  v-for="bank in availableBanks" 
                  :key="bank.code" 
                  :value="bank.code"
                >
                  {{ bank.name }}
                </option>
              </select>
            </div>
            
            <!-- Account Holder Name -->
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="account-name">
                Account Holder Name <span class="text-red-500">*</span>
              </label>
              <input 
                id="account-name" 
                v-model="newBank.owner" 
                type="text" 
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter your full name as on bank account"
                required
              />
              <p class="mt-1 text-sm text-gray-500">Must match the name registered with your bank</p>
            </div>
            
            <!-- Account Number -->
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="account-number">
                Account Number <span class="text-red-500">*</span>
              </label>
              <input 
                id="account-number" 
                v-model="newBank.account" 
                type="text" 
                class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Enter account number"
                required
              />
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                type="button"
                @click="showAddBankForm = false" 
                class="py-3 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="py-3 px-6 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                :disabled="isLoading"
              >
                <span v-if="isLoading">
                  <i class="fas fa-spinner fa-spin mr-2"></i> Adding...
                </span>
                <span v-else>
                  <i class="fas fa-plus mr-2"></i>Add Bank Account
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
import { defineComponent, ref, onMounted } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import MemberCenter2 from './MemberCenter2.vue';

export default defineComponent({
  name: 'BankAccountsPage',
  components: {
    MemberCenter2
  },
  setup() {
    const toast = useToast();
    const isLoading = ref(false);
    const bankAccounts = ref<any[]>([]);
    const showAddBankForm = ref(false);
    
    const availableBanks = [
      { code: 'AFFIN_BANK', name: 'Affin Bank' },
      { code: 'AGROBANK', name: 'Agro Bank' },
      { code: 'ALLIANCE', name: 'Alliance Bank' },
      { code: 'AMBANK', name: 'Ambank' },
      { code: 'BSN', name: 'BSN' },
      { code: 'CIMB', name: 'CIMB Bank' },
      { code: 'CITIBANK', name: 'Citibank' },
      { code: 'HLB', name: 'Hong Leong Bank' },
      { code: 'HSBC', name: 'HSBC Bank' },
      { code: 'ISLAM_BANK', name: 'Bank Islam' },
      { code: 'MAYBANK', name: 'Maybank' },
      { code: 'MBSB', name: 'MBSB Bank' },
      { code: 'MUAMALAT_BANK', name: 'Bank Muamalat' },
      { code: 'OCBC', name: 'OCBC Bank' },
      { code: 'PBE', name: 'Public Bank' },
      { code: 'RAKYAT_BANK', name: 'Bank Rakyat' },
      { code: 'RHB', name: 'RHB Bank' },
      { code: 'SC_BANK', name: 'Standard Chartered Bank' },
      { code: 'UOB', name: 'UOB Bank' }
    ];
    
    // New bank account form
    const newBank = ref({
      bank: '',
      owner: '',
      account: ''
    });

    const extractBankAccounts = (response: any): any[] => {
      const data = response?.data ?? response;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.banks)) return data.banks;
      return [];
    };
    
    // Load bank accounts
    const loadBankAccounts = async () => {
      try {
        isLoading.value = true;
        
        const response = await api.getBankAccounts();
        bankAccounts.value = extractBankAccounts(response);
      } catch (error) {
        console.error('Failed to load bank accounts:', error);
        toast.error('Failed to load bank accounts');
      } finally {
        isLoading.value = false;
      }
    };
    
    // Add bank account
    const handleAddBank = async () => {
      try {
        isLoading.value = true;
        
        // Validate form
        if (!newBank.value.bank || !newBank.value.owner || !newBank.value.account) {
          toast.error('Please fill in all required fields');
        return;
      }
      
        // Process bank account creation
        const response = await api.createBankAccount({
          bank: newBank.value.bank,
          owner: newBank.value.owner,
          account: newBank.value.account
        });
        
        if (response && response.success) {
          toast.success('Bank account added successfully');
          showAddBankForm.value = false;
          
          // Reset form
          newBank.value = {
            bank: '',
            owner: '',
            account: ''
          };
          
          await loadBankAccounts();
        }
      } catch (error: any) {
        console.error('Bank account creation error:', error);
        
        // Handle specific errors
        let errorMessage = 'Failed to create bank account. Please try again.';
        
        if (error.message) {
          const msg = error.message.toLowerCase();
          
          if (msg.includes('method must be a non-empty string')) {
            errorMessage = '🏦 Banking service temporarily unavailable. Please try again later or contact support.';
          } else if (msg.includes('api request failed with status 500')) {
            errorMessage = '🏦 Banking system error: The banking service is currently experiencing issues. Please try again in a few minutes.';
          } else if (msg.includes('authentication') || msg.includes('token')) {
            errorMessage = '🔐 Session expired. Please log in again.';
          } else if (msg.includes('validation') || msg.includes('required')) {
            errorMessage = '📝 Please check all required fields are filled correctly.';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast.error(errorMessage);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Get bank name from ID
    const getBankName = (account: any): string => {
      const bankCode = account?.bank || account?.bank_code || account?.shortname || account?.bankid;
      const bank = availableBanks.find(b => b.code === bankCode);
      return bank ? bank.name : account?.bank_name || account?.name || String(bankCode || 'Unknown Bank');
    };
    
    // Format account number for display
    const formatAccountNumber = (account: any): string => {
      const accountNumber = String(account?.account || account?.accountnumber || account?.number || account?.account_number || '');
      if (!accountNumber) return '';
      
      // Mask middle digits for security
      if (accountNumber.length > 8) {
        const start = accountNumber.substring(0, 4);
        const end = accountNumber.substring(accountNumber.length - 4);
        const middle = '*'.repeat(accountNumber.length - 8);
        return `${start}${middle}${end}`;
      }
      
      return accountNumber;
    };
        
    // Format date
    const formatDate = (account: any): string => {
      const dateObj = account?.datecreate || account?.created_at;
      if (typeof dateObj === 'string') return dateObj;
      if (!dateObj || !dateObj.datestring) return 'Unknown';
      return dateObj.datestring;
    };

    const getAccountHolder = (account: any): string => {
      return account?.owner || account?.name || account?.accountname || account?.account_name || 'Account Holder';
    };
        
    // Set primary account
    const setPrimaryAccount = async (account: any) => {
      try {
        // This would need to be implemented in the API
        toast.info('Set primary account functionality would be implemented here');
      } catch (error) {
        console.error('Failed to set primary account:', error);
        toast.error('Failed to set primary account');
      }
    };

    // Remove account
    const removeAccount = async (account: any) => {
      try {
        const result = await Swal.fire({
          title: 'Remove Bank Account',
          text: 'Are you sure you want to remove this bank account?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, remove it',
          cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
          const bankId = account.bank_id || account.id || account.iid;
          if (!bankId) {
            toast.error('Unable to identify bank account');
            return;
          }

          await api.deleteBankAccount(bankId);
          toast.success('Bank account removed successfully');
          await loadBankAccounts();
        }
      } catch (error) {
        console.error('Failed to remove account:', error);
        toast.error('Failed to remove account');
      }
    };

    onMounted(() => {
      loadBankAccounts();
    });

    return {
      isLoading,
      bankAccounts,
      showAddBankForm,
      availableBanks,
      newBank,
      handleAddBank,
      getBankName,
      formatAccountNumber,
      formatDate,
      getAccountHolder,
      setPrimaryAccount,
      removeAccount
    };
  }
});
</script>

<style scoped>
.bank-card {
  transition: all 0.3s ease;
}

.bank-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
</style> 
