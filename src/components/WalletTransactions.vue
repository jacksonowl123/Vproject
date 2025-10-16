<template>
  <div class="wallet-transactions">
    <h2>Wallet Transactions</h2>
    
    <div class="balance-section">
      <h3>Wallet Balance: {{ accountBalance }}</h3>
      <button @click="refreshBalance" class="refresh-btn">Refresh</button>
    </div>
    
    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'deposit' }"
        @click="activeTab = 'deposit'"
      >
        Deposit
      </button>
      <button 
        :class="{ active: activeTab === 'withdraw' }"
        @click="activeTab = 'withdraw'"
      >
        Withdraw
      </button>
      <button 
        :class="{ active: activeTab === 'transfer' }"
        @click="activeTab = 'transfer'"
      >
        Transfer
      </button>
      <button 
        :class="{ active: activeTab === 'platforms' }"
        @click="activeTab = 'platforms'"
      >
        Platforms
      </button>
    </div>
    
    <!-- Deposit Form -->
    <div v-if="activeTab === 'deposit'" class="tab-content">
      <h3>Deposit Credits</h3>
      <form @submit.prevent="handleDeposit">
        <div class="form-group">
          <label for="deposit-amount">Amount</label>
          <input 
            id="deposit-amount" 
            v-model.number="depositForm.amount" 
            type="number" 
            step="0.01" 
            min="10"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="deposit-remarks">Remarks</label>
          <input 
            id="deposit-remarks" 
            v-model="depositForm.remarks" 
            type="text"
          />
        </div>
        
        <!-- Deposit Method Section Hidden -->
        
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Processing...' : 'Submit Manual Deposit' }}
        </button>
      </form>
    </div>
    
    <!-- Withdraw Form -->
    <div v-if="activeTab === 'withdraw'" class="tab-content">
      <h3>Withdraw Credits</h3>
      
      <div v-if="!userBankAccounts.length" class="no-banks-warning">
        <p>You need to add a bank account before withdrawing funds.</p>
        <button @click="showAddBankForm = true" class="action-btn">Add Bank Account</button>
      </div>
      
      <form v-else @submit.prevent="handleWithdraw">
        <div class="form-group">
          <label for="withdraw-bank">Select Bank Account</label>
          <select 
            id="withdraw-bank" 
            v-model.number="withdrawForm.bankid" 
            required
          >
            <option v-for="bank in userBankAccounts" :key="bank.iid" :value="bank.iid">
              {{ bank.name }} - {{ bank.accountnumber }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="withdraw-amount">Amount</label>
          <input 
            id="withdraw-amount" 
            v-model.number="withdrawForm.amount" 
            type="number" 
            step="0.01" 
            min="10"
            required
          />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Processing...' : 'Withdraw Now' }}
        </button>
      </form>
      
      <!-- Add Bank Account Form -->
      <div v-if="showAddBankForm" class="modal">
        <div class="modal-content">
          <span class="close" @click="showAddBankForm = false">&times;</span>
          <h3>Add Bank Account</h3>
          
          <form @submit.prevent="handleAddBankAccount">
            <div class="form-group">
              <label for="bank-select">Select Bank</label>
              <select id="bank-select" v-model.number="bankForm.bankid" required>
                <option v-for="(id, name) in banks" :key="id" :value="id">
                  {{ name.replace('_', ' ') }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="account-name">Account Holder Name</label>
              <input 
                id="account-name" 
                v-model="bankForm.name" 
                type="text" 
                required
              />
            </div>
            
            <div class="form-group">
              <label for="account-number">Account Number</label>
              <input 
                id="account-number" 
                v-model="bankForm.accountnumber" 
                type="text" 
                required
              />
            </div>
            
            <button type="submit" class="submit-btn" :disabled="isLoading">
              {{ isLoading ? 'Processing...' : 'Add Bank Account' }}
            </button>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Transfer Form -->
    <div v-if="activeTab === 'transfer'" class="tab-content">
      <h3>Transfer Credits</h3>
      
      <div class="transfer-direction">
        <button 
          :class="{ active: transferDirection === 'to' }"
          @click="transferDirection = 'to'"
        >
          Wallet to Game
        </button>
        <button 
          :class="{ active: transferDirection === 'from' }"
          @click="transferDirection = 'from'"
        >
          Game to Wallet
        </button>
      </div>
      
      <form @submit.prevent="handleTransfer">
        <div class="form-group">
          <label for="transfer-platform">Select Platform</label>
          <select 
            id="transfer-platform" 
            v-model.number="transferForm.platformId" 
            required
          >
            <option v-for="game in games" :key="game.id" :value="game.id">
              {{ game.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="transfer-amount">Amount</label>
          <input 
            id="transfer-amount" 
            v-model.number="transferForm.amount" 
            type="number" 
            step="0.01" 
            min="10"
            required
          />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Processing...' : transferDirection === 'to' ? 'Transfer to Game' : 'Transfer to Wallet' }}
        </button>
      </form>
    </div>
    
    <!-- Platforms Balance -->
    <div v-if="activeTab === 'platforms'" class="tab-content">
      <h3>Platform Balances</h3>
      <button @click="refreshPlatformBalances" class="refresh-btn">Refresh Balances</button>
      
      <div class="platforms-list">
        <div 
          v-for="platform in platformBalances" 
          :key="platform.platformid" 
          class="platform-item"
        >
          <div class="platform-info">
            <span class="platform-name">{{ platform.platformname || getPlatformName(platform.platformid) }}</span>
            <span class="platform-balance">{{ platform.balance.amount }}</span>
          </div>
          <div class="platform-actions">
            <button 
              @click="quickTransferTo(platform.platformid)" 
              class="action-btn small"
            >
              Transfer To
            </button>
            <button 
              @click="quickTransferFrom(platform.platformid)" 
              class="action-btn small"
              :disabled="parseFloat(platform.balance.amount) <= 0"
            >
              Transfer From
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, reactive, computed } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';
import { BANK_IDS, INCENTIVE_IDS, PLATFORM_IDS, getPlatformName } from '@/utils/reference-ids';
import { useToast } from 'vue-toastification';

export default defineComponent({
  name: 'WalletTransactions',
  
  setup() {
    const toast = useToast();
    const activeTab = ref('deposit');
    const isLoading = ref(false);
    const accountBalance = ref('0.00');
    const userBankAccounts = ref([]);
    const incentives = ref([]);
    const platformBalances = ref([]);
    const showAddBankForm = ref(false);
    const transferDirection = ref('to');
    
    // Form data
    const depositForm = reactive({
      amount: 10,
      remarks: ''
    });
    
    const withdrawForm = reactive({
      bankid: 0,
      amount: 10
    });
    
    const bankForm = reactive({
      bankid: BANK_IDS.MAYBANK,
      name: '',
      accountnumber: ''
    });
    
    const transferForm = reactive({
      platformId: PLATFORM_IDS.ASIA_GAMING,
      amount: 10
    });
    
    // Get available games from the API
    const games = computed(() => api.getGames());
    
    // List of banks (simplified implementation)
    const banks = computed(() => {
      // Filter out the special deposit bank ID
      const filteredBanks = { ...BANK_IDS };
      delete filteredBanks.DEPOSIT_BANK_ID;
      return filteredBanks;
    });
    
    // Load initial data
    onMounted(async () => {
      try {
        await refreshBalance();
        await loadUserBankAccounts();
        await loadIncentives();
        await refreshPlatformBalances();
      } catch (error) {
        console.error('Error initializing wallet:', error);
        toast.error('Failed to load wallet data');
      }
    });
    
    // Load user's bank accounts
    const loadUserBankAccounts = async () => {
      try {
        // Assume the member details API includes bank accounts
        const memberDetails = await api.getMemberDetails();
        if (memberDetails && memberDetails.banks) {
          userBankAccounts.value = memberDetails.banks;
        }
      } catch (error) {
        console.error('Error loading bank accounts:', error);
        toast.error('Failed to load bank accounts');
      }
    };
    
    // Load available incentives
    const loadIncentives = async () => {
      try {
        const response = await api.getIncentives();
        if (response && response.system) {
          incentives.value = response.system;
        }
      } catch (error) {
        console.error('Error loading incentives:', error);
        toast.error('Failed to load incentives');
      }
    };
    
    // Refresh wallet balance
    const refreshBalance = async () => {
      try {
        const memberDetails = await api.getMemberDetails();
        if (memberDetails && memberDetails.account) {
          accountBalance.value = memberDetails.account.balance;
        }
      } catch (error) {
        console.error('Error refreshing balance:', error);
        toast.error('Failed to refresh balance');
      }
    };
    
    // Refresh platform balances
    const refreshPlatformBalances = async () => {
      try {
        isLoading.value = true;
        const response = await api.getAllPlatformsBalance();
        platformBalances.value = response;
      } catch (error) {
        console.error('Error refreshing platform balances:', error);
        toast.error('Failed to refresh platform balances');
      } finally {
        isLoading.value = false;
      }
    };
    
    // Handle deposit submission
    const handleDeposit = async () => {
      try {
        isLoading.value = true;
        
        const depositParams = {
          amount: depositForm.amount,
          remarks: depositForm.remarks
        };
        
        // Use manual deposit API (only option)
        const response = await api.depositManual(depositParams);
        
        if (response && response.success) {
          toast.success('Deposit request submitted for approval');
          
          // Reset form
          depositForm.amount = 10;
          depositForm.remarks = '';
          
          // Refresh balance
          await refreshBalance();
        } else {
          toast.error('Manual deposit failed. Please try again.');
        }
      } catch (error) {
        console.error('Deposit error:', error);
        toast.error('Deposit failed. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };
    
    // Handle withdraw submission
    const handleWithdraw = async () => {
      try {
        isLoading.value = true;
        const response = await api.withdraw(
          withdrawForm.amount,
          withdrawForm.bankid
        );
        
        if (response && response.status !== undefined) {
          if (response.status === 0) {
            toast.success('Withdrawal request submitted successfully');
            await refreshBalance();
          } else {
            toast.error('Withdrawal request failed');
          }
        }
      } catch (error) {
        console.error('Withdrawal error:', error);
        toast.error('Withdrawal failed. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };
    
    // Handle add bank account submission
    const handleAddBankAccount = async () => {
      try {
        isLoading.value = true;
        const response = await api.createBankAccount({
          bankid: bankForm.bankid,
          name: bankForm.name,
          accountnumber: bankForm.accountnumber
        });
        
        if (response && response.iid) {
          toast.success('Bank account added successfully');
          showAddBankForm.value = false;
          
          // Add the new bank to the list
          userBankAccounts.value.push(response);
          
          // Reset form
          bankForm.name = '';
          bankForm.accountnumber = '';
        }
      } catch (error) {
        console.error('Add bank account error:', error);
        toast.error('Failed to add bank account. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };
    
    // Handle transfer submission
    const handleTransfer = async () => {
      try {
        isLoading.value = true;
        
        let response;
        if (transferDirection.value === 'to') {
          response = await api.transferTo(
            transferForm.amount,
            transferForm.platformId
          );
        } else {
          response = await api.transferFrom(
            transferForm.amount,
            transferForm.platformId
          );
        }
        
        if (response && response.status !== undefined) {
          if (response.status === 2) { // Assuming 2 is the success status based on API response example
            toast.success('Transfer completed successfully');
            await refreshBalance();
            await refreshPlatformBalances();
          } else {
            toast.error('Transfer request failed');
          }
        }
      } catch (error) {
        console.error('Transfer error:', error);
        toast.error('Transfer failed. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };
    
    // Quick transfer to platform
    const quickTransferTo = (platformId: number) => {
      transferDirection.value = 'to';
      transferForm.platformId = platformId;
      activeTab.value = 'transfer';
    };
    
    // Quick transfer from platform
    const quickTransferFrom = (platformId: number) => {
      transferDirection.value = 'from';
      transferForm.platformId = platformId;
      activeTab.value = 'transfer';
    };
    
    return {
      activeTab,
      isLoading,
      accountBalance,
      userBankAccounts,
      incentives,
      platformBalances,
      showAddBankForm,
      transferDirection,
      depositForm,
      withdrawForm,
      bankForm,
      transferForm,
      games,
      banks,
      refreshBalance,
      refreshPlatformBalances,
      handleDeposit,
      handleWithdraw,
      handleAddBankAccount,
      handleTransfer,
      quickTransferTo,
      quickTransferFrom
    };
  }
});
</script>

<style scoped>
.wallet-transactions {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.balance-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tabs button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
}

.tabs button.active {
  border-bottom: 3px solid #4caf50;
  color: #4caf50;
  font-weight: 600;
}

.tab-content {
  padding: 20px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin-right: 10px;
}

.checkbox-group label {
  display: inline;
  margin-bottom: 0;
}

.submit-btn,
.action-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.submit-btn:hover,
.action-btn:hover {
  background-color: #45a049;
}

.submit-btn:disabled,
.action-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.refresh-btn {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.refresh-btn:hover {
  background-color: #0b7dda;
}

.no-banks-warning {
  text-align: center;
  padding: 20px;
  background-color: #fff9c4;
  border-radius: 4px;
  margin-bottom: 20px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

.transfer-direction {
  display: flex;
  margin-bottom: 20px;
}

.transfer-direction button {
  flex: 1;
  padding: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  cursor: pointer;
}

.transfer-direction button.active {
  background-color: #e0e0e0;
  font-weight: 600;
}

.platforms-list {
  margin-top: 20px;
}

.platform-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.platform-info {
  flex: 1;
}

.platform-name {
  font-weight: 600;
  margin-right: 10px;
}

.platform-balance {
  color: #4caf50;
  font-weight: 600;
}

.platform-actions {
  display: flex;
  gap: 10px;
}

.action-btn.small {
  padding: 8px 12px;
  font-size: 14px;
}
</style> 