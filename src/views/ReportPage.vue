<template>
  <div>
    <member-center-2>
      <!-- Report Content -->
      <div class="p-4 max-w-6xl mx-auto">
        <!-- Filters and Controls -->
        <div class="bg-white p-4 rounded-lg shadow-md mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <!-- Report Type Selection -->
            <div class="inline-flex rounded-md shadow-sm" role="group">
              <button
                v-for="(type, index) in reportTypes"
                :key="type.id"
                @click="selectedReportType = type.id"
                :class="[
                  'px-4 py-2 text-sm font-medium',
                  index === 0 ? 'rounded-l-lg' : '',
                  index === reportTypes.length - 1 ? 'rounded-r-lg' : '',
                  selectedReportType === type.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100',
                  'border border-gray-300'
                ]"
              >
                <i :class="['mr-2', type.icon]"></i>
                {{ type.name }}
              </button>
            </div>

            <!-- Date Range Picker -->
            <div class="flex items-center space-x-2">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i class="fas fa-calendar-alt text-gray-500"></i>
                </div>
                <input
                  type="date"
                  v-model="startDate"
                  class="pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <span class="text-gray-500">to</span>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i class="fas fa-calendar-alt text-gray-500"></i>
                </div>
                <input
                  type="date"
                  v-model="endDate"
                  class="pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <!-- Search and Filters -->
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Search Bar -->
            <div class="relative flex-grow">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i class="fas fa-search text-gray-500"></i>
              </div>
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search by transaction ID or amount..."
                class="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md"
              />
            </div>

            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="border border-gray-300 rounded-md py-2 pl-3 pr-8"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <!-- Apply Filters Button -->
            <button
              @click="applyFilters"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>

        <!-- Report Content Based on Type -->
        <div class="bg-white p-4 rounded-lg shadow-md">
          <h3 class="text-xl font-semibold mb-4">
            {{ selectedReportType === 'all' ? 'All Transactions' : 
               selectedReportType === 'deposits' ? 'Deposit History' :
               selectedReportType === 'withdrawals' ? 'Withdrawal History' : 'Game Transactions' }}
          </h3>

          <!-- Transactions Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white">
              <thead class="bg-gray-100">
                <tr>
                  <th class="py-3 px-4 text-left font-semibold text-sm text-gray-700">DATE</th>
                  <th class="py-3 px-4 text-left font-semibold text-sm text-gray-700">TRANSACTION ID</th>
                  <th class="py-3 px-4 text-left font-semibold text-sm text-gray-700">TYPE</th>
                  <th class="py-3 px-4 text-left font-semibold text-sm text-gray-700">AMOUNT</th>
                  <th class="py-3 px-4 text-left font-semibold text-sm text-gray-700">STATUS</th>
                  <th class="py-3 px-4 text-left font-semibold text-sm text-gray-700">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="hover:bg-gray-50">
                  <td class="py-3 px-4 text-sm">{{ formatDate(transaction.date) }}</td>
                  <td class="py-3 px-4 text-sm">{{ getTransactionDetails(transaction) }}</td>
                  <td class="py-3 px-4">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs rounded-full',
                        transaction.type === 'deposit' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'withdrawal' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      ]"
                    >
                      {{ transaction.type === 'deposit' ? 'Deposit' : 
                         transaction.type === 'withdrawal' ? 'Withdrawal' : 'Game' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm" :class="transaction.amount > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ formatAmount(transaction.amount) }}
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      :class="[
                        'px-2 py-1 text-xs rounded-full',
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ transaction.status === 'completed' ? 'Completed' : 
                         transaction.status === 'pending' ? 'Pending' : 'Rejected' }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <button 
                      @click="showTransactionDetails(transaction)" 
                      class="text-blue-600 hover:text-blue-800"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredTransactions.length === 0">
                  <td colspan="6" class="py-8 text-center text-gray-500">
                    No transactions found for the selected criteria
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center mt-6">
            <div class="text-sm text-gray-500">
              Showing {{ filteredTransactions.length }} of {{ transactions.length }} transactions
            </div>
            <div class="flex space-x-1">
              <button 
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-1 rounded-md border',
                  currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-1 rounded-md border',
                  currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                ]"
              >
                {{ page }}
              </button>
              <button 
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-3 py-1 rounded-md border',
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'
                ]"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </member-center-2>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import Swal from 'sweetalert2';
import MemberCenter2 from './MemberCenter2.vue';
import { laravelApi as api } from '@/services/laravelApi';

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: string;
  details?: any;
}

export default defineComponent({
  name: 'ReportPage',
  components: {
    MemberCenter2
  },
  setup() {
    // Initialize state variables
    const isLoading = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const selectedReportType = ref('all');
    const statusFilter = ref('all');
    const searchQuery = ref('');
    const startDate = ref('');
    const endDate = ref('');
    const transactions = ref<Transaction[]>([]);

    // Report type selection
    const reportTypes = [
      { id: 'all', name: 'All', icon: 'fas fa-list' },
      { id: 'deposits', name: 'Deposits', icon: 'fas fa-money-bill-wave' },
      { id: 'withdrawals', name: 'Withdrawals', icon: 'fas fa-hand-holding-usd' },
      { id: 'games', name: 'Games', icon: 'fas fa-gamepad' }
    ];

    // Fetch transactions from API
    const fetchTransactions = async () => {
      try {
        isLoading.value = true;
        
        // Get date range (default to last 30 days if no dates selected)
        const end = endDate.value || new Date().toISOString();
        const start = startDate.value || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Convert report type to transaction type
        let type = 'all';
        if (selectedReportType.value === 'deposits') type = 'deposit';
        if (selectedReportType.value === 'withdrawals') type = 'withdrawal';
        if (selectedReportType.value === 'games') type = 'game';
        
        // Fetch transactions from API
        const response = await api.getTransactions(start, end, type, statusFilter.value);
        
        if (Array.isArray(response)) {
          transactions.value = response;
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // Show error message
      } finally {
        isLoading.value = false;
      }
    };

    // Apply filters function
    const applyFilters = () => {
      currentPage.value = 1; // Reset to first page when filters change
      fetchTransactions(); // Fetch transactions with new filters
    };

    // Filtered transactions based on selections
    const filteredTransactions = computed(() => {
      let filtered = [...transactions.value];
      
      // Filter by type
      if (selectedReportType.value !== 'all') {
        filtered = filtered.filter(t => {
          if (selectedReportType.value === 'deposits') return t.type === 'deposit';
          if (selectedReportType.value === 'withdrawals') return t.type === 'withdrawal';
          if (selectedReportType.value === 'games') return t.type === 'game';
          return true;
        });
      }
      
      // Filter by status
      if (statusFilter.value !== 'all') {
        filtered = filtered.filter(t => t.status === statusFilter.value);
      }
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(t => 
          t.id.toLowerCase().includes(query) || 
          t.amount.toString().includes(query)
        );
      }
      
      // Filter by date range
      if (startDate.value) {
        filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate.value));
      }
      
      if (endDate.value) {
        filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate.value));
      }
      
      return filtered;
    });

    // Pagination calculations
    const totalPages = computed(() => {
      return Math.ceil(filteredTransactions.value.length / itemsPerPage);
    });

    // Show transaction details
    const showTransactionDetails = (transaction: Transaction) => {
      Swal.fire({
        title: `Transaction: ${transaction.id}`,
        html: `
          <div class="text-left">
            <p><strong>Date:</strong> ${formatDate(transaction.date)}</p>
            <p><strong>Type:</strong> ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</p>
            <p><strong>Amount:</strong> ${formatAmount(transaction.amount)}</p>
            <p><strong>Status:</strong> ${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</p>
            <p><strong>Details:</strong> ${transaction.details || 'No details available'}</p>
          </div>
        `,
        confirmButtonColor: '#3B82F6'
      });
    };

    // Utility functions
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatAmount = (amount: number) => {
      const currency = 'MYR';
      return `${amount > 0 ? '+' : ''}${currency} ${Math.abs(amount).toFixed(2)}`;
    };

    // Render transaction details based on type
    const getTransactionDetails = (transaction: Transaction): string => {
      if (!transaction.details) return transaction.id;
      
      switch (transaction.type) {
        case 'deposit':
          return `${transaction.details.method || 'Deposit'} via ${transaction.details.bank || 'Bank'}`;
        case 'withdrawal':
          return `To ${transaction.details.bank || 'Bank'} (${transaction.details.accountNumber || '****'})`;
        case 'transfer':
          return transaction.amount > 0 
            ? `From ${transaction.details.platform || 'Platform'}`
            : `To ${transaction.details.platform || 'Platform'}`;
        case 'game':
          return transaction.details.game 
            ? `${transaction.details.game} - ${transaction.details.platform || 'Platform'}`
            : `Game on ${transaction.details.platform || 'Platform'}`;
        default:
          return transaction.id;
      }
    };

    // Initial data load
    onMounted(() => {
      fetchTransactions();
    });

    return {
      reportTypes,
      selectedReportType,
      startDate,
      endDate,
      searchQuery,
      statusFilter,
      currentPage,
      transactions,
      filteredTransactions,
      totalPages,
      applyFilters,
      showTransactionDetails,
      formatDate,
      formatAmount,
      getTransactionDetails
    };
  }
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  text-align: left;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>
  