<template>
  <div class="p-4 max-w-md mx-auto">
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Development Login</h2>
      
      <div class="mb-6">
        <p class="text-gray-700 mb-4">This page allows you to activate a fixed development account with pre-populated data for testing purposes.</p>
        <div class="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 class="font-bold text-blue-700 mb-2">Development Account Details:</h3>
          <ul class="space-y-1 pl-5 list-disc text-blue-800">
            <li>Username: <span class="font-mono">devuser</span></li>
            <li>Email: <span class="font-mono">dev@example.com</span></li>
            <li>Cash Balance: MYR 10,000.00</li>
            <li>Chips Balance: MYR 5,000.00</li>
            <li>Status: Active</li>
            <li>Banks: Development Bank, CIMB Bank</li>
          </ul>
        </div>
      </div>
      
      <div class="flex flex-col gap-3">
        <button 
          @click="activateDevMode" 
          class="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold text-center"
        >
          Activate Development Login
        </button>
        
        <button 
          @click="deactivateDevMode" 
          class="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center"
        >
          Clear Development Mode
        </button>
      </div>
      
      <div v-if="message" class="mt-4 p-3 rounded-lg" :class="messageClass">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDevLogin, clearDevMode, checkDevMode } from '@/store/devAuth';

export default defineComponent({
  name: 'DevLogin',
  setup() {
    const router = useRouter();
    const message = ref('');
    const messageType = ref('');
    
    const messageClass = computed(() => {
      switch (messageType.value) {
        case 'success':
          return 'bg-green-100 text-green-800';
        case 'error':
          return 'bg-red-100 text-red-800';
        case 'info':
          return 'bg-blue-100 text-blue-800';
        default:
          return '';
      }
    });
    
    const activateDevMode = () => {
      try {
        useDevLogin();
        message.value = 'Development login activated successfully! Redirecting to home page...';
        messageType.value = 'success';
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/userProfile');
        }, 1500);
      } catch (error) {
        message.value = `Error activating development login: ${error}`;
        messageType.value = 'error';
      }
    };
    
    const deactivateDevMode = () => {
      try {
        clearDevMode();
        message.value = 'Development mode cleared. You will need to log in normally.';
        messageType.value = 'info';
      } catch (error) {
        message.value = `Error clearing development mode: ${error}`;
        messageType.value = 'error';
      }
    };
    
    // Check if dev mode is active on component load
    if (checkDevMode()) {
      message.value = 'Development mode is currently active.';
      messageType.value = 'info';
    }
    
    return {
      message,
      messageClass,
      activateDevMode,
      deactivateDevMode
    };
  }
});
</script> 