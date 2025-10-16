<template>
  <div class="p-4">
    <h2 class="text-2xl mb-4">Transactions</h2>
    <div class="flex flex-col sm:flex-row justify-between mb-4 items-center">
      <div class="flex space-x-2 mb-4 sm:mb-0">
        <button
          v-for="month in displayedMonths"
          :key="month"
          @click="selectMonth(month)"
          :class="['px-4 py-2', { 'bg-blue-500 text-white': selectedMonth === month, 'bg-gray-300': selectedMonth !== month }]"
          class="rounded-lg"
        >
          {{ month }}
        </button>
      </div>
      <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <select v-model="selectedCurrency" class="p-2 border rounded-lg">
          <option value="all">All Currencies</option>
          <option value="MYR">MYR</option>
          <option value="USD">USD</option>
        </select>
        <select v-model="selectedType" class="p-2 border rounded-lg">
          <option value="all">All Types</option>
          <option value="Top Up">Top Up</option>
          <option value="Withdraw">Withdraw</option>
          <option value="Start Game">Start Game</option>
          <option value="Quit Game">Quit Game</option>
          <option value="Game settlement">Game settlement</option>
          <option value="Transfer">Transfer</option>
          <option value="Exchange">Exchange</option>
          <option value="Game Rewards">Game Rewards</option>
          <option value="System rewards">System rewards</option>
          <option value="Game Adjustment">Game Adjustment</option>
          <option value="Order Adjustment">Order Adjustment</option>
          <option value="Withdraw Refund">Withdraw Refund</option>
          <option value="Order Cancel">Order Cancel</option>
          <option value="Normal AP">Normal AP</option>
          <option value="Lucky AP">Lucky AP</option>
          <option value="Receive Ang Pao">Receive Ang Pao</option>
          <option value="Ang Pao Refund">Ang Pao Refund</option>
        </select>
      </div>
    </div>
    <div class="bg-white p-4 rounded-lg">
      <h3 class="text-xl mb-4">Game Rewards</h3>
      <div v-for="transaction in filteredTransactions" :key="transaction.id" class="mb-4 p-4 bg-gray-100 rounded-lg">
        <p class="mb-2 text-lg">Chips</p>
        <p class="mb-2 text-lg">{{ transaction.date }}</p>
        <p class="mb-2">{{ transaction.amount }}</p>
        <p class="mb-2">No. {{ transaction.id }}</p>
        <p class="mb-2">Pay From <span class="text-blue-500">WINBOX</span></p>
        <button class="text-blue-500">Details</button>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs';

export default {
  name: 'TransactionsPage',
  data() {
    return {
      transactions: [
        { id: 'RB20240625163232743692138', date: '2024-06-25 16:32:32', amount: 'MYR 8.80', currency: 'MYR', type: 'Game Rewards' },
        { id: 'RB2024062416022741473306', date: '2024-06-24 16:06:22', amount: 'MYR 11.80', currency: 'MYR', type: 'Game Rewards' },
        { id: 'RB2024062315414527247170', date: '2024-06-23 15:41:41', amount: 'MYR 0.39', currency: 'MYR', type: 'Game Rewards' },
        { id: 'RB20240621152821089667737', date: '2024-06-21 15:28:21', amount: 'MYR 1.08', currency: 'MYR', type: 'Game Rewards' },
        { id: 'RB20240620153133728806021', date: '2024-06-20 15:31:33', amount: 'MYR 0.01', currency: 'MYR', type: 'Game Rewards' },
        // More transactions can be added here
      ],
      selectedMonth: dayjs().format('MM-YY'),
      selectedCurrency: 'all',
      selectedType: 'all',
    };
  },
  computed: {
    displayedMonths() {
      const months = [];
      for (let i = 0; i < 3; i++) {
        months.push(dayjs().subtract(i, 'month').format('MM-YY'));
      }
      return months;
    },
    filteredTransactions() {
      return this.transactions.filter(transaction => {
        const transactionMonth = dayjs(transaction.date).format('MM-YY');
        const matchMonth = this.selectedMonth === transactionMonth;
        const matchCurrency = this.selectedCurrency === 'all' || transaction.currency === this.selectedCurrency;
        const matchType = this.selectedType === 'all' || transaction.type === this.selectedType;
        return matchMonth && matchCurrency && matchType;
      });
    },
  },
  methods: {
    selectMonth(month) {
      this.selectedMonth = month;
    },
  },
};
</script>

<style scoped>
/* Add any additional styling here */
</style>
