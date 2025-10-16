<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-[100] bg-black bg-opacity-50 transition-opacity duration-300"
    @click="$emit('close')"
  >
    <div 
      class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-all duration-300 ease-in-out"
      :class="{ 'translate-x-0': isOpen, '-translate-x-full': !isOpen }"
      style="z-index: 101;"
      @click.stop
    >
      <!-- Sidebar Header -->
      <div class="p-4 border-b flex justify-between items-center bg-white">
        <h2 class="text-lg font-semibold">Menu</h2>
        <button @click="$emit('close')" class="text-gray-500">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Sidebar Content -->
      <div class="py-4 bg-white h-full overflow-y-auto">
        <template v-if="!isLoggedIn">
          <div class="px-4 py-2">
            <router-link 
              to="/login" 
              class="block w-full py-2 px-4 text-center bg-[#0066FF] text-white rounded-lg mb-2"
              @click="$emit('close')"
            >
              Login
            </router-link>
            <router-link 
              to="/register" 
              class="block w-full py-2 px-4 text-center border-2 border-[#0066FF] text-[#0066FF] rounded-lg"
              @click="$emit('close')"
            >
              Register
            </router-link>
          </div>
        </template>
        
        <template v-else>
          <!-- User Profile Section -->
          <div class="px-4 py-3 border-b">
            <div class="flex items-center mb-3">
              <div class="bg-blue-100 p-2 rounded-full mr-3">
                <i class="fas fa-user text-blue-500"></i>
              </div>
              <div>
                <p class="font-semibold">{{ username }}</p>
                <p class="text-sm text-gray-500">{{ memberEmail }}</p>
              </div>
            </div>

            <!-- Balance Information -->
            <div class="bg-gray-100 p-3 rounded-lg mb-3">
              <div class="flex justify-between mb-2">
                <span class="text-sm">Cash Balance:</span>
                <span class="text-sm font-medium">
                  {{ memberCash.currency }} {{ isBalanceHidden ? '******' : memberCash.amount }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm">Chips Balance:</span>
                <span class="text-sm font-medium">
                  {{ memberChips.currency }} {{ isBalanceHidden ? '******' : memberChips.amount }}
                </span>
              </div>
              <button 
                @click="toggleBalanceVisibility" 
                class="w-full mt-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center"
              >
                <i :class="isBalanceHidden ? 'fas fa-eye mr-1' : 'fas fa-eye-slash mr-1'"></i>
                {{ isBalanceHidden ? 'Show Balance' : 'Hide Balance' }}
              </button>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-2 gap-2">
              <router-link 
                to="/deposit" 
                class="bg-blue-500 text-white py-2 rounded text-center text-sm hover:bg-blue-600"
                @click="$emit('close')"
              >
                <i class="fas fa-money-bill-wave mr-1"></i> Deposit
              </router-link>
              <router-link 
                to="/wallet" 
                class="bg-green-500 text-white py-2 rounded text-center text-sm hover:bg-green-600"
                @click="$emit('close')"
              >
                <i class="fas fa-wallet mr-1"></i> Wallet
              </router-link>
            </div>
          </div>
        </template>

        <!-- Navigation Links -->
        <nav class="mt-4">
          <router-link 
            v-for="(item, index) in menuItems" 
            :key="index"
            :to="item.path"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-100"
            @click="$emit('close')"
          >
            <i :class="item.icon" class="mr-3"></i>
            {{ item.name }}
          </router-link>
          
          <!-- Logout Button -->
          <button 
            v-if="isLoggedIn"
            @click="handleLogout" 
            class="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            <i class="fas fa-sign-out-alt mr-3"></i>
            Logout
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { authState } from '@/store/auth';
import { clearDevMode } from '@/store/devAuth';
import { useRouter } from 'vue-router';

export default {
  name: 'SidebarMenu',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    isLoggedIn: {
      type: Boolean,
      required: true
    },
    username: {
      type: String,
      default: ''
    },
    menuItems: {
      type: Array,
      required: true
    }
  },
  emits: ['close', 'logout'],
  setup(props, { emit }) {
    const isBalanceHidden = ref(true);
    const router = useRouter();
    
    // Get user details from authState
    const memberEmail = computed(() => {
      return authState.memberDetails?.email || '';
    });
    
    const memberCash = computed(() => {
      return authState.memberDetails?.account?.cash || { currency: 'MYR', amount: '0.00' };
    });
    
    const memberChips = computed(() => {
      return authState.memberDetails?.account?.chips || { currency: 'MYR', amount: '0.00' };
    });
    
    const toggleBalanceVisibility = () => {
      isBalanceHidden.value = !isBalanceHidden.value;
    };
    
    const handleLogout = () => {
      // Remove token from local storage
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // Emit logout event
      emit('logout');
      
      // Close the sidebar
      emit('close');
      
      // Redirect to login page
      router.push('/login');
    };
    
    return {
      isBalanceHidden,
      memberEmail,
      memberCash,
      memberChips,
      toggleBalanceVisibility,
      handleLogout
    };
  }
}
</script>

<style scoped>
@media (min-width: 768px) {
  .fixed {
    position: relative;
  }
}
</style> 