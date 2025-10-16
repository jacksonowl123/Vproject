<template>
    <div class="p-4 flex flex-col items-center">
      <!-- Back Button, Logo, Game Name, and Top-Up Button -->
      <div class="self-stretch mb-4 flex items-center justify-between">
        <button @click="goBack" class="text-xl">
          <i class="fas fa-arrow-left"></i>
        </button>
        <div class="flex items-center mx-auto">
          <img class="w-16 h-16" :src="game.logo" alt="Game Logo" />
          <h1 class="text-2xl font-bold ml-4">{{ game.name }}</h1>
        </div>
        <button class="bg-transparent">
          <img class="w-10 h-10" :src="game.topUpButton" alt="Top Up" />
        </button>
      </div>
  
      <!-- Game Banner -->
      <div class="relative w-full lg:w-2/3 mb-8">
        <img class="w-full h-auto" :src="game.image" alt="Game Banner" />
      </div>
  
      <!-- Game Details Section -->
      <div class="w-full lg:w-2/3 bg-white p-8 rounded-lg shadow-md text-center">
        <p class="text-red-500 mb-4">Game Rewards: {{ game.rewards }}</p>
        <div class="flex justify-between mb-4">
          <p>Balance (MYR): {{ game.balance }}</p>
          <p>Chips (MYR): {{ game.chips }}</p>
          <p>Amount (MYR): {{ game.amount }}</p>
        </div>
        <div class="text-4xl font-bold mb-4">{{ game.total }}</div>
        <div class="flex justify-center mb-4">
          <button v-for="amount in game.amounts" :key="amount" class="bg-gray-200 py-2 px-4 rounded mx-1">{{ amount }}</button>
        </div>
        <button class="bg-blue-500 text-white py-2 px-4 rounded">Start Game</button>
        <div class="flex justify-between mt-4">
          <p>Turnover: {{ game.turnover }}</p>
          <p>Last Turnover: {{ game.lastTurnover }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { svgPlaceholder } from '@/assets';
  export default {
    name: 'GameDetailsPage',
    data() {
      return {
        game: {
          name: 'Pokerwin',
          image: bannerPlaceholder,
          logo: iconPlaceholder,
          topUpButton: iconPlaceholder,
          rewards: '0.5%',
          balance: '0.00',
          chips: '86.04',
          amount: '86.04',
          total: '0.00',
          amounts: [50, 100, 500, '1K', '5K', '10K'],
          turnover: '--',
          lastTurnover: '--',
        },
        bannerPlaceholder: svgPlaceholder(1200, 400, '#111827', '#FFFFFF', 'Game Banner'),
        iconPlaceholder: svgPlaceholder(64, 64, '#4B5563', '#FFFFFF', 'Logo'),
      };
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add any additional styling here */
  </style>
  