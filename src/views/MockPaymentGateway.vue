<template>
  <div class="p-4 max-w-md mx-auto">
    <div class="bg-white p-6 rounded-lg shadow-md text-center">
      <div class="mb-4 text-green-500">
        <i class="fas fa-check-circle text-6xl"></i>
      </div>
      <h2 class="text-2xl font-bold mb-2">Mock Payment Successful</h2>
      <p class="mb-6 text-gray-600">
        Your deposit of {{ amount }} MYR has been processed successfully in the development environment.
      </p>
      <p class="text-sm text-gray-500 mb-2">Redirecting to wallet in {{ countdown }} seconds...</p>
      <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
          :style="{ width: `${100 - (countdown / 5) * 100}%` }"
        ></div>
      </div>
      <button 
        @click="redirectNow" 
        class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
      >
        Go to Wallet Now
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { checkDevMode } from '@/store/devAuth';

export default defineComponent({
  name: 'MockPaymentGateway',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const amount = ref(route.query.amount || '0.00');
    const countdown = ref(5);
    let timer: number | null = null;

    const redirectNow = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      router.push('/wallet');
    };

    onMounted(() => {
      // Check if we're in development mode
      if (!checkDevMode()) {
        // If not in dev mode, redirect immediately
        redirectNow();
        return;
      }

      // Start countdown
      timer = window.setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          redirectNow();
        }
      }, 1000);
    });

    onBeforeUnmount(() => {
      if (timer) {
        clearInterval(timer);
      }
    });

    return {
      amount,
      countdown,
      redirectNow
    };
  }
});
</script> 