<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800">Transaction Summary</h3>
      <router-link 
        to="/report" 
        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View Full Report <i class="fas fa-arrow-right ml-1"></i>
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
      <p class="text-red-600 text-sm">{{ error }}</p>
      <button 
        @click="loadSummary" 
        class="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
      >
        Retry
      </button>
    </div>

    <!-- Summary Content -->
    <div v-else>
      <!-- Quick Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div class="text-green-600 text-2xl mb-1">
            <i class="fas fa-arrow-down"></i>
          </div>
          <div class="text-lg font-bold text-green-700">{{ formatAmount(summary.totalDeposits) }}</div>
          <div class="text-xs text-green-600">{{ summary.depositCount }} Deposits</div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div class="text-blue-600 text-2xl mb-1">
            <i class="fas fa-arrow-up"></i>
          </div>
          <div class="text-lg font-bold text-blue-700">{{ formatAmount(summary.totalWithdrawals) }}</div>
          <div class="text-xs text-blue-600">{{ summary.withdrawalCount }} Withdrawals</div>
        </div>

        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div class="text-purple-600 text-2xl mb-1">
            <i class="fas fa-balance-scale"></i>
          </div>
          <div class="text-lg font-bold" :class="summary.netAmount >= 0 ? 'text-green-700' : 'text-red-700'">
            {{ formatAmount(summary.netAmount) }}
          </div>
          <div class="text-xs text-purple-600">Net Amount</div>
        </div>

        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <div class="text-gray-600 text-2xl mb-1">
            <i class="fas fa-list"></i>
          </div>
          <div class="text-lg font-bold text-gray-700">{{ summary.totalTransactions }}</div>
          <div class="text-xs text-gray-600">Total Transactions</div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="border-t pt-6">
        <h4 class="text-lg font-medium text-gray-800 mb-4">Recent Transactions</h4>
        
        <div v-if="recentTransactions.length === 0" class="text-center py-6 text-gray-500">
          <i class="fas fa-inbox text-3xl mb-2"></i>
          <p>No recent transactions found</p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="transaction in recentTransactions" 
            :key="transaction.iid || transaction.id" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                :class="{
                  'bg-green-100 text-green-600': getTransactionType(transaction) === 'deposit',
                  'bg-blue-100 text-blue-600': getTransactionType(transaction) === 'withdrawal',
                  'bg-purple-100 text-purple-600': getTransactionType(transaction) === 'game'
                }"
              >
                <i 
                  class="fas"
                  :class="{
                    'fa-arrow-down': getTransactionType(transaction) === 'deposit',
                    'fa-arrow-up': getTransactionType(transaction) === 'withdrawal',
                    'fa-gamepad': getTransactionType(transaction) === 'game'
                  }"
                ></i>
              </div>
              <div>
                <div class="font-medium text-gray-900">
                  {{ getTransactionTypeLabel(transaction) }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ formatDate(transaction.datecreate || transaction.date) }}
                </div>
                <div class="text-xs text-gray-400">
                  ID: {{ transaction.serial || transaction.id || transaction.iid }}
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <div 
                class="font-medium"
                :class="{
                  'text-green-600': getTransactionAmount(transaction) > 0,
                  'text-red-600': getTransactionAmount(transaction) < 0,
                  'text-gray-600': getTransactionAmount(transaction) === 0
                }"
              >
                {{ formatAmount(getTransactionAmount(transaction)) }}
              </div>
              <div class="text-xs">
                <span 
                  class="px-2 py-1 rounded-full text-xs"
                  :class="{
                    'bg-green-100 text-green-800': getTransactionStatus(transaction) === 'completed',
                    'bg-yellow-100 text-yellow-800': getTransactionStatus(transaction) === 'pending',
                    'bg-red-100 text-red-800': getTransactionStatus(transaction) === 'rejected'
                  }"
                >
                  {{ getTransactionStatusLabel(transaction) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- View More Link -->
        <div v-if="recentTransactions.length > 0" class="text-center mt-4">
          <router-link 
            to="/report" 
            class="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Transactions <i class="fas fa-arrow-right ml-1"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { laravelApi as api } from '@/services/laravelApi';

interface Transaction {
  iid?: number;
  id?: string;
  date?: string;
  datecreate?: any;
  type?: string;
  amount?: number;
  status?: string | number;
  details?: any;
  serial?: string;
  credit?: any;
  debit?: any;
  reference?: string;
  remarks?: string;
}

interface Summary {
  totalDeposits: number;
  totalWithdrawals: number;
  depositCount: number;
  withdrawalCount: number;
  totalTransactions: number;
  netAmount: number;
}

export default defineComponent({
  name: 'TransactionSummary',
  props: {
    days: {
      type: Number,
      default: 7 // Show last 7 days by default
    },
    maxRecent: {
      type: Number,
      default: 5 // Show 5 most recent transactions
    }
  },
  setup(props) {
    const isLoading = ref(false);
    const error = ref('');
    const transactions = ref<Transaction[]>([]);

    // Summary statistics
    const summary = computed((): Summary => {
      const stats = {
        totalDeposits: 0,
        totalWithdrawals: 0,
        depositCount: 0,
        withdrawalCount: 0,
        totalTransactions: 0,
        netAmount: 0
      };

      transactions.value.forEach(transaction => {
        const type = getTransactionType(transaction);
        const amount = getTransactionAmount(transaction);
        
        stats.totalTransactions++;
        
        if (type === 'deposit') {
          stats.totalDeposits += Math.abs(amount);
          stats.depositCount++;
        } else if (type === 'withdrawal') {
          stats.totalWithdrawals += Math.abs(amount);
          stats.withdrawalCount++;
        }
      });

      stats.netAmount = stats.totalDeposits - stats.totalWithdrawals;
      return stats;
    });

    // Recent transactions (sorted by date, newest first)
    const recentTransactions = computed(() => {
      return [...transactions.value]
        .sort((a, b) => {
          const dateA = new Date(a.datecreate?.datestring || a.datecreate || a.date || 0);
          const dateB = new Date(b.datecreate?.datestring || b.datecreate || b.date || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, props.maxRecent);
    });

    // Helper functions
    const getTransactionType = (transaction: Transaction): string => {
      if (transaction.type) return transaction.type;
      
      // Determine type based on amount and other fields
      if (transaction.credit && transaction.credit.value > 0) return 'deposit';
      if (transaction.debit && transaction.debit.value > 0) return 'withdrawal';
      
      return 'other';
    };

    const getTransactionTypeLabel = (transaction: Transaction): string => {
      const type = getTransactionType(transaction);
      switch (type) {
        case 'deposit': return 'Deposit';
        case 'withdrawal': return 'Withdrawal';
        case 'game': return 'Game';
        default: return 'Other';
      }
    };

    const getTransactionAmount = (transaction: Transaction): number => {
      if (transaction.amount !== undefined) return transaction.amount;
      if (transaction.credit && transaction.credit.value) return transaction.credit.value;
      if (transaction.debit && transaction.debit.value) return -transaction.debit.value;
      return 0;
    };

    const getTransactionStatus = (transaction: Transaction): string => {
      if (typeof transaction.status === 'string') return transaction.status;
      if (typeof transaction.status === 'number') {
        switch (transaction.status) {
          case 0: return 'completed';
          case 1: return 'pending';
          case 2: return 'rejected';
          default: return 'unknown';
        }
      }
      return 'unknown';
    };

    const getTransactionStatusLabel = (transaction: Transaction): string => {
      const status = getTransactionStatus(transaction);
      switch (status) {
        case 'completed': return 'Completed';
        case 'pending': return 'Pending';
        case 'rejected': return 'Rejected';
        default: return 'Unknown';
      }
    };

    // Utility functions
    const formatDate = (dateInput: string | any) => {
      let date: Date;
      
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput && dateInput.datestring) {
        date = new Date(dateInput.datestring);
      } else if (dateInput && dateInput.date) {
        date = new Date(dateInput.date);
      } else {
        return 'Unknown';
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatAmount = (amount: number) => {
      const currency = 'MYR';
      const absAmount = Math.abs(amount);
      const sign = amount >= 0 ? '+' : '';
      return `${sign}${currency} ${absAmount.toFixed(2)}`;
    };

    // Load transaction summary
    const loadSummary = async () => {
      try {
        isLoading.value = true;
        error.value = '';
        
        // Get date range for the last N days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - props.days);
        
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        
        console.log(`Loading transaction summary for last ${props.days} days: ${start} to ${end}`);
        
        // Fetch transactions from API
        const response = await api.getTransactions(start, end, '', ''); // All types, all statuses
        
        // Handle different response formats
        if (response && response.data && Array.isArray(response.data)) {
          transactions.value = response.data;
        } else if (Array.isArray(response)) {
          transactions.value = response;
        } else if (response && response.success && Array.isArray(response.data)) {
          transactions.value = response.data;
        } else {
          console.warn('Unexpected response format:', response);
          transactions.value = [];
        }
        
        console.log(`Loaded ${transactions.value.length} transactions for summary`);
      } catch (err: any) {
        console.error('Error loading transaction summary:', err);
        error.value = 'Failed to load transaction data';
        transactions.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // Load data on mount
    onMounted(() => {
      loadSummary();
    });

    return {
      isLoading,
      error,
      summary,
      recentTransactions,
      loadSummary,
      formatDate,
      formatAmount,
      getTransactionType,
      getTransactionTypeLabel,
      getTransactionAmount,
      getTransactionStatus,
      getTransactionStatusLabel
    };
  }
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 