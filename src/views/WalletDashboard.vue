<template>
  <div class="wallet-dashboard container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Wallet Dashboard</h1>
    
    <!-- Balance Summary -->
    <div class="bg-gray-100 rounded-lg p-4 mb-6 shadow-md">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-gray-500 text-sm">Main Wallet Balance</h3>
          <div class="text-2xl font-bold">{{ mainBalance }}</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-gray-500 text-sm">Bonus Balance</h3>
          <div class="text-2xl font-bold text-orange-600">{{ bonusBalance }}</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-gray-500 text-sm">Game Platforms Balance</h3>
          <div class="text-2xl font-bold">{{ totalPlatformBalance }}</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-gray-500 text-sm">Total Balance</h3>
          <div class="text-2xl font-bold">{{ totalAllBalance }}</div>
        </div>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="mb-4 border-b">
      <div class="flex flex-wrap -mb-px">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'inline-block py-4 px-4 text-sm font-medium text-center border-b-2',
            activeTab === tab.id 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300'
          ]"
        >
          <i :class="tab.icon" class="mr-2"></i>
          {{ tab.name }}
        </button>
      </div>
    </div>
    
    <!-- Tab Content -->
    <div class="tab-content mb-6">
      <!-- Deposit Tab -->
      <div v-if="activeTab === 'deposit'" class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Deposit Funds</h2>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="deposit-amount">
            Amount
          </label>
          <input 
            id="deposit-amount" 
            v-model.number="depositAmount" 
            type="number" 
            min="10" 
            class="w-full p-3 border rounded" 
            placeholder="Min: 10.00"
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="deposit-bonus">
            Select Bonus
          </label>
          <select 
            id="deposit-bonus" 
            v-model="selectedBonus" 
            class="w-full p-3 border rounded"
          >
            <option :value="null">No Bonus</option>
            <option 
              v-for="bonus in bonuses" 
              :key="bonus.iid" 
              :value="bonus.iid"
            >
              {{ bonus.name }}
            </option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="deposit-remarks">
            Remarks (Optional)
          </label>
          <textarea 
            id="deposit-remarks" 
            v-model="depositRemarks" 
            class="w-full p-3 border rounded" 
            placeholder="Any notes for this deposit"
          ></textarea>
        </div>
        
        <!-- Manual Deposit Option -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="manual-deposit" 
              v-model="useManualDeposit" 
              class="mr-2"
            />
            <label for="manual-deposit" class="text-sm font-medium text-gray-700">
              Use Manual Deposit (Direct API)
            </label>
          </div>
          
          <router-link 
            to="/deposit/manual" 
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Go to Manual Deposit Page
          </router-link>
        </div>
        
        <button 
          @click="handleDeposit" 
          class="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 w-full"
          :disabled="isProcessing"
        >
          <span v-if="isProcessing">
            <i class="fas fa-spinner fa-spin mr-2"></i>Processing...
          </span>
          <span v-else>
            {{ useManualDeposit ? 'Submit Manual Deposit' : 'Proceed to Payment' }}
          </span>
        </button>
      </div>
      
      <!-- Withdraw Tab -->
      <div v-if="activeTab === 'withdraw'" class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Withdraw Funds</h2>
        
        <div v-if="!bankAccounts.length" class="text-center py-8">
          <i class="fas fa-exclamation-circle text-yellow-500 text-5xl mb-4"></i>
          <p class="mb-4">You need to add a bank account before withdrawing funds.</p>
          <button 
            @click="showAddBankForm = true" 
            class="bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700"
          >
            Add Bank Account
          </button>
        </div>
        
        <div v-else>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="withdraw-bank">
              Select Bank Account
            </label>
            <select 
              id="withdraw-bank" 
              v-model="selectedBank" 
              class="w-full p-3 border rounded"
            >
              <option 
                v-for="bank in bankAccounts" 
                :key="bank.iid" 
                :value="bank.iid"
              >
                {{ bank.name }} - {{ bank.accountnumber }}
              </option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="withdraw-amount">
              Amount
            </label>
            <input 
              id="withdraw-amount" 
              v-model.number="withdrawAmount" 
              type="number" 
              min="10" 
              class="w-full p-3 border rounded" 
              placeholder="Min: 10.00"
            />
          </div>
          
          <button 
            @click="handleWithdraw" 
            class="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 w-full"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">
              <i class="fas fa-spinner fa-spin mr-2"></i> Processing...
            </span>
            <span v-else>
              Withdraw Now
            </span>
          </button>
        </div>
      </div>
      
      <!-- Transfer Tab -->
      <div v-if="activeTab === 'transfer'" class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Transfer Funds</h2>
        
        <div class="mb-6">
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="transferDirection = 'to'"
              :class="[
                'py-2 px-4 text-center border font-medium rounded-lg',
                transferDirection === 'to'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              ]"
            >
              Wallet to Game
            </button>
            <button 
              @click="transferDirection = 'from'"
              :class="[
                'py-2 px-4 text-center border font-medium rounded-lg',
                transferDirection === 'from'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              ]"
            >
              Game to Wallet
            </button>
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="transfer-platform">
            Select Game Platform
          </label>
          <select 
            id="transfer-platform" 
            v-model="selectedPlatform" 
            class="w-full p-3 border rounded"
          >
            <option 
              v-for="platform in gamePlatforms" 
              :key="platform.id" 
              :value="platform.id"
            >
              {{ platform.name }}
            </option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="transfer-amount">
            Amount
          </label>
          <input 
            id="transfer-amount" 
            v-model.number="transferAmount" 
            type="number" 
            min="10" 
            class="w-full p-3 border rounded" 
            placeholder="Min: 10.00"
          />
        </div>
        
        <button 
          @click="handleTransfer" 
          class="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 w-full"
          :disabled="isProcessing"
        >
          <span v-if="isProcessing">
            <i class="fas fa-spinner fa-spin mr-2"></i> Processing...
          </span>
          <span v-else>
            {{ transferDirection === 'to' ? 'Transfer to Game' : 'Transfer to Wallet' }}
          </span>
        </button>
      </div>
      
      <!-- Game Platforms Tab -->
      <div v-if="activeTab === 'platforms'" class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Game Platform Balances</h2>
          <button 
            @click="refreshPlatformBalances"
            class="bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 text-sm"
            :disabled="isProcessing"
          >
            <i class="fas fa-sync-alt mr-1"></i> Refresh
          </button>
        </div>
        
        <div v-if="isProcessing" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-blue-600 text-4xl"></i>
          <p class="mt-2">Loading platform balances...</p>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="platform in platformBalances" 
            :key="platform.platformid"
            class="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-center mb-2">
              <div>
                <h3 class="font-semibold">{{ platform.platformname || getPlatformName(platform.platformid) }}</h3>
                <p class="text-sm text-gray-500">{{ platform.platformcode || `Platform ${platform.platformid}` }}</p>
              </div>
              <div>
                <span class="font-bold text-green-600">{{ platform.balance.amount }}</span>
              </div>
            </div>
            <div class="flex space-x-2 mt-2">
              <button 
                @click="quickTransferTo(platform.platformid)"
                class="bg-blue-600 text-white py-1 px-3 rounded text-sm"
              >
                <i class="fas fa-arrow-up mr-1"></i> Transfer To
              </button>
              <button 
                @click="quickTransferFrom(platform.platformid)"
                class="bg-green-600 text-white py-1 px-3 rounded text-sm"
                :disabled="parseFloat(platform.balance.amount) <= 0"
              >
                <i class="fas fa-arrow-down mr-1"></i> Transfer From
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bank Accounts Tab -->
      <div v-if="activeTab === 'banks'" class="bg-white p-6 rounded-lg shadow-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Bank Accounts</h2>
          <button 
            @click="showAddBankForm = true"
            class="bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 text-sm"
          >
            <i class="fas fa-plus mr-1"></i> Add Bank
          </button>
        </div>
        
        <div v-if="!bankAccounts.length" class="text-center py-8">
          <i class="fas fa-university text-gray-400 text-5xl mb-4"></i>
          <p>You don't have any bank accounts yet.</p>
          <p class="text-sm text-gray-500">Add a bank account to enable withdrawals.</p>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="bank in bankAccounts" 
            :key="bank.iid"
            class="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-semibold">{{ bank.name }}</h3>
                <p class="text-sm">{{ bank.accountnumber }}</p>
              </div>
              <!-- Banks are typically not easy to delete, but we could add actions here -->
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add Bank Account Modal -->
    <div v-if="showAddBankForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Add Bank Account</h3>
          <button @click="showAddBankForm = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="bank-select">
            Select Bank
          </label>
          <select 
            id="bank-select" 
            v-model="newBank.bankid" 
            class="w-full p-3 border rounded"
            required
          >
            <option 
              v-for="(id, name) in bankOptions" 
              :key="id" 
              :value="id"
            >
              {{ formatBankName(name) }}
            </option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="account-name">
            Account Holder Name
          </label>
          <input 
            id="account-name" 
            v-model="newBank.name" 
            type="text" 
            class="w-full p-3 border rounded" 
            placeholder="Enter your name as on bank account"
            required
          />
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="account-number">
            Account Number
          </label>
          <input 
            id="account-number" 
            v-model="newBank.accountnumber" 
            type="text" 
            class="w-full p-3 border rounded" 
            placeholder="Enter account number"
            required
          />
        </div>
        
        <div class="flex justify-end space-x-2">
          <button 
            @click="showAddBankForm = false" 
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button 
            @click="handleAddBank" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing">
              <i class="fas fa-spinner fa-spin mr-2"></i> Processing...
            </span>
            <span v-else>
              Save Bank Account
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, computed } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';
import { BANK_IDS, PLATFORM_IDS, getPlatformName } from '@/utils/reference-ids';
import { useToast } from 'vue-toastification';
import { authState } from '@/store/auth';

export default defineComponent({
  name: 'WalletDashboard',
  props: {
    defaultTab: {
      type: String,
      default: 'deposit'
    }
  },
  
  setup(props) {
    const toast = useToast();
    const isProcessing = ref(false);
    
    // Tabs
    const activeTab = ref(props.defaultTab);
    const tabs = [
      { id: 'deposit', name: 'Deposit', icon: 'fas fa-plus-circle' },
      { id: 'withdraw', name: 'Withdraw', icon: 'fas fa-minus-circle' },
      { id: 'transfer', name: 'Transfer', icon: 'fas fa-exchange-alt' },
      { id: 'platforms', name: 'Game Platforms', icon: 'fas fa-gamepad' },
      { id: 'banks', name: 'Bank Accounts', icon: 'fas fa-university' }
    ];
    
    // Balances
    const mainBalance = ref('0.00');
    const bonusBalance = ref('0.00');
    const platformBalances = ref<any[]>([]);
    const totalPlatformBalance = computed(() => {
      if (!platformBalances.value.length) return '0.00';
      return platformBalances.value.reduce((total, platform) => {
        return total + parseFloat(platform.balance.amount || '0');
      }, 0).toFixed(2);
    });
    
    const totalAllBalance = computed(() => {
      return (parseFloat(mainBalance.value) + parseFloat(bonusBalance.value) + parseFloat(totalPlatformBalance.value)).toFixed(2);
    });
    
    // Deposit
    const depositAmount = ref(10);
    const selectedBonus = ref(null);
    const depositRemarks = ref('');
    const bonuses = ref<any[]>([]);
    const useManualDeposit = ref(false);
    
    // Withdraw
    const withdrawAmount = ref(10);
    const selectedBank = ref(null);
    const bankAccounts = ref<any[]>([]);
    
    // Transfer
    const transferAmount = ref(10);
    const selectedPlatform = ref(PLATFORM_IDS.ASIA_GAMING);
    const transferDirection = ref('to');
    const gamePlatforms = computed(() => api.getGames());
    
    // Add Bank
    const showAddBankForm = ref(false);
    const newBank = reactive({
      bankid: BANK_IDS.MAYBANK,
      name: '',
      accountnumber: ''
    });
    
    // Format bank name
    const formatBankName = (name: string) => {
      return name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
    };
    
    // List of banks (excluding the special deposit bank)
    const bankOptions = computed(() => {
      const options = { ...BANK_IDS };
      delete options.DEPOSIT_BANK_ID;
      return options;
    });
    
    // Load initial data
    onMounted(async () => {
      try {
        await loadMemberDetails();
        await loadBankAccounts();
        await loadIncentives();
        await loadPlatformBalances();
      } catch (error) {
        console.error('Failed to load wallet data:', error);
        toast.error('Failed to load wallet data');
      }
    });
    
    // Load member details (account info)
    const loadMemberDetails = async () => {
      try {
        console.log('🔍 WalletDashboard - Loading member details...');
        const memberDetails = await api.getMemberDetails();
        
        if (memberDetails && memberDetails.account) {
          if (memberDetails.account.cash) {
          mainBalance.value = memberDetails.account.cash.amount;
            console.log('✅ Main balance loaded:', memberDetails.account.cash.amount);
          } else {
            console.warn('⚠️ No cash balance data in member details');
            mainBalance.value = '0.00';
          }
          
          // Load bonus balance if available
          if (memberDetails.account.bonus) {
            bonusBalance.value = memberDetails.account.bonus.amount;
            console.log('✅ Bonus balance loaded:', memberDetails.account.bonus.amount);
          } else {
            console.log('ℹ️ No bonus balance data in member details');
            bonusBalance.value = '0.00';
          }
          
          // Update auth state with fresh data
          authState.memberDetails = memberDetails;
        } else {
          console.error('❌ No account data in member details response');
          mainBalance.value = '0.00';
          bonusBalance.value = '0.00';
          throw new Error('No account data received');
        }
      } catch (error) {
        console.error('❌ Failed to load member details:', error);
        mainBalance.value = '0.00';
        bonusBalance.value = '0.00';
        toast.error('Failed to load balance info');
        throw error;
      }
    };
    
    // Load bank accounts
    const loadBankAccounts = async () => {
      try {
        // Normal API mode
        const details = await api.getMemberDetails();
        if (details && details.banks) {
          bankAccounts.value = details.banks;
          if (bankAccounts.value.length) {
            selectedBank.value = bankAccounts.value[0].iid;
          }
        }
      } catch (error) {
        console.error('Failed to load bank accounts:', error);
        toast.error('Failed to load bank accounts');
        throw error;
      }
    };
    
    // Load incentives
    const loadIncentives = async () => {
      try {
        const response = await api.getIncentives();
        if (response && response.system) {
          bonuses.value = response.system;
        }
      } catch (error) {
        console.error('Failed to load incentives:', error);
        throw error;
      }
    };
    
    // Load platform balances
    const loadPlatformBalances = async () => {
      try {
        isProcessing.value = true;
        const response = await api.getAllPlatformsBalance();
        platformBalances.value = response;
      } catch (error) {
        console.error('Failed to load platform balances:', error);
        throw error;
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Handle deposit
    const handleDeposit = async () => {
      if (depositAmount.value < 10) {
        toast.error('Minimum deposit amount is 10.00');
        return;
      }
      
      try {
        isProcessing.value = true;
        
        const depositParams = {
          amount: depositAmount.value,
          remarks: depositRemarks.value
        };
        
        if (useManualDeposit.value) {
          // Use manual deposit API
          const response = await api.depositManual(depositParams);
          
          if (response && response.success) {
            toast.success('Deposit request submitted successfully for approval');
            
            // Reset form
            depositAmount.value = 10;
            selectedBonus.value = null;
            depositRemarks.value = '';
            
            // Refresh member details to show updated balance
            await loadMemberDetails();
          } else {
            toast.error('Deposit failed. Please try again.');
          }
        } else {
          // Use payment gateway
          const redirectUrl = await api.depositViaGateway(depositParams);
          
          // Redirect to payment page
          window.location.href = redirectUrl;
        }
      } catch (error) {
        console.error('Deposit failed:', error);
        toast.error('Deposit failed. Please try again.');
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Handle withdraw
    const handleWithdraw = async () => {
      if (!selectedBank.value) {
        toast.error('Please select a bank account');
        return;
      }
      
      if (withdrawAmount.value < 10) {
        toast.error('Minimum withdrawal amount is 10.00');
        return;
      }
      
      try {
        isProcessing.value = true;
        
        const response = await api.withdraw(
          withdrawAmount.value,
          selectedBank.value
        );
        
        if (response && response.status !== undefined) {
          if (response.status === 0) {
            toast.success('Withdrawal request submitted successfully');
            await loadMemberDetails();
          } else {
            toast.error('Withdrawal request failed');
          }
        }
      } catch (error) {
        console.error('Withdrawal failed:', error);
        toast.error('Withdrawal failed. Please try again.');
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Handle transfer
    const handleTransfer = async () => {
      if (transferAmount.value < 10) {
        toast.error('Minimum transfer amount is 10.00');
        return;
      }
      
      try {
        isProcessing.value = true;
        
        let response;
        if (transferDirection.value === 'to') {
          response = await api.transferTo(
            transferAmount.value,
            selectedPlatform.value
          );
        } else {
          response = await api.transferFrom(
            transferAmount.value,
            selectedPlatform.value
          );
        }
        
        if (response && response.status !== undefined) {
          if (response.status === 2) {
            toast.success('Transfer completed successfully');
            await loadMemberDetails();
            await loadPlatformBalances();
          } else {
            toast.error('Transfer failed');
          }
        }
      } catch (error) {
        console.error('Transfer failed:', error);
        toast.error('Transfer failed. Please try again.');
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Handle add bank
    const handleAddBank = async () => {
      if (!newBank.name || !newBank.accountnumber) {
        toast.error('Please fill all required fields');
        return;
      }
      
      try {
        isProcessing.value = true;
        
        const response = await api.createBankAccount({
          bankid: newBank.bankid,
          name: newBank.name,
          accountnumber: newBank.accountnumber
        });
        
        if (response && response.iid) {
          toast.success('Bank account added successfully');
          
          // Add to local list and reset form
          bankAccounts.value.push(response);
          selectedBank.value = response.iid;
          
          // Reset form and close modal
          newBank.name = '';
          newBank.accountnumber = '';
          showAddBankForm.value = false;
        }
      } catch (error) {
        console.error('Failed to add bank account:', error);
        toast.error('Failed to add bank account. Please try again.');
      } finally {
        isProcessing.value = false;
      }
    };
    
    // Refresh platform balances
    const refreshPlatformBalances = async () => {
      try {
        await loadPlatformBalances();
        toast.success('Platform balances refreshed');
      } catch (error) {
        toast.error('Failed to refresh platform balances');
      }
    };
    
    // Quick transfer methods
    const quickTransferTo = (platformId: number) => {
      selectedPlatform.value = platformId;
      transferDirection.value = 'to';
      activeTab.value = 'transfer';
    };
    
    const quickTransferFrom = (platformId: number) => {
      selectedPlatform.value = platformId;
      transferDirection.value = 'from';
      activeTab.value = 'transfer';
    };
    
    return {
      // UI state
      isProcessing,
      activeTab,
      tabs,
      showAddBankForm,
      
      // Balance data
      mainBalance,
      bonusBalance,
      platformBalances,
      totalPlatformBalance,
      totalAllBalance,
      
      // Deposit
      depositAmount,
      selectedBonus,
      depositRemarks,
      bonuses,
      useManualDeposit,
      handleDeposit,
      
      // Withdraw
      withdrawAmount,
      selectedBank,
      bankAccounts,
      handleWithdraw,
      
      // Transfer
      transferAmount,
      selectedPlatform,
      transferDirection,
      gamePlatforms,
      handleTransfer,
      
      // Bank accounts
      newBank,
      bankOptions,
      formatBankName,
      handleAddBank,
      
      // Platform balance
      refreshPlatformBalances,
      
      // Quick actions
      quickTransferTo,
      quickTransferFrom
    };
  }
});
</script> 