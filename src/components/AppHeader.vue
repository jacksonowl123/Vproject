<template>
  <div class="bg-white shadow-md px-4 py-2 flex justify-between items-center">
    <!-- Left section -->
    <div class="flex items-center md:flex-1">
      <!-- Web Hamburger - Only visible on md and above -->
      <button 
        @click="$emit('toggle-web-sidebar')" 
        class="hidden md:flex items-center text-gray-500 mr-4"
      >
        <i class="fas fa-bars text-xl"></i>
      </button>

      <!-- Mobile Hamburger - Hidden on md and above -->
      <button 
        @click="$emit('toggle-mobile-sidebar')" 
        class="md:hidden flex items-center text-gray-500"
      >
        <i class="fas fa-bars text-xl"></i>
      </button>

      <!-- Logo - Show on both mobile and desktop -->
      <img :src="dummyImages.logo" alt="Elive" class="h-10 ml-3 md:h-12 md:ml-0">
    </div>

    <!-- Right section -->
    <div class="flex items-center justify-end gap-2">
      <!-- Login/Register buttons - Show on all screen sizes if not logged in -->
      <template v-if="!authState.isLoggedIn">
        <div class="flex items-center space-x-2 md:space-x-4">
          <router-link 
            to="/login" 
            class="px-3 py-1.5 md:px-6 md:py-2 text-[#0066FF] font-semibold hover:text-blue-700 text-sm md:text-base"
          >
            Login
          </router-link>
          <router-link 
            to="/register" 
            class="px-3 py-1.5 md:px-6 md:py-2 bg-[#0066FF] text-white rounded-lg font-semibold hover:bg-blue-600 text-sm md:text-base"
          >
            Register
          </router-link>
        </div>
      </template>
      <!-- Logout button - Show when logged in -->
      <template v-else>
        <button 
          @click="handleLogout" 
          class="px-3 py-1.5 md:px-6 md:py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 text-sm md:text-base"
        >
          Logout
        </button>
      </template>
    </div>
  </div>
</template>

<script>
import { dummyImages } from '@/assets'
import { watch } from 'vue'
import { authState, setLoginState } from '@/store/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter()

    // Add a watcher for authState
    watch(() => authState.isLoggedIn, (newValue) => {
      console.log('Header - isLoggedIn changed:', newValue);
    });

    const handleLogout = () => {
      setLoginState(false, '');
      router.push('/login');
    };

    const toggleLanguage = () => {
      console.log('Toggle language');
    };

    return { 
      authState,
      dummyImages,
      handleLogout,
      toggleLanguage
    };
  },
  mounted() {
    console.log('Header mounted - isLoggedIn:', authState.isLoggedIn);
  }
}
</script>
