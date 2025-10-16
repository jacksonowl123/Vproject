<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
      <div class="text-center">
        <!-- Success Icon -->
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <i class="fas fa-check text-green-600 text-xl"></i>
        </div>
        
        <!-- Title -->
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Registration Successful!
        </h3>
        
        <!-- Message -->
        <p class="text-sm text-gray-500 mb-6">
          Your account has been created successfully. You can now login with your phone number and password.
        </p>
        
        <!-- Button -->
        <button
          @click="handleLogin"
          class="w-full bg-[#0066FF] text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Login Now
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SuccessModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    credentials: {
      type: Object,
      required: true
    }
  },
  emits: ['proceed-to-login'],
  setup(props, { emit }) {
    const handleLogin = () => {
      emit('proceed-to-login', props.credentials);
    };

    return {
      handleLogin
    };
  }
});
</script> 