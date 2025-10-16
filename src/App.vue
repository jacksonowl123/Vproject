<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <header>
      <AppHeader
        @toggle-web-sidebar="toggleWebSidebar"
        @toggle-mobile-sidebar="toggleMobileSidebar"
      />
    </header>
    <div class="flex flex-1 overflow-auto">
      <!-- Permanent Web Sidebar - Only visible on md and above -->
      <div 
        class="hidden md:block bg-[#1E2024] text-gray-300 h-full transition-all duration-300 relative"
        :class="{ 
          'w-16': !isWebSidebarOpen,
          'w-64': isWebSidebarOpen 
        }"
      >
        <div :class="isWebSidebarOpen ? 'w-64' : 'w-16'">
          <nav class="space-y-2 py-4">
            <router-link 
              to="/"
              class="flex items-center hover:bg-gray-700 relative group"
              :class="isWebSidebarOpen ? 'px-4 py-2' : 'px-4 py-3 justify-center'"
            >
              <i class="fas fa-gamepad" :class="isWebSidebarOpen ? 'mr-3' : ''"></i>
              <span v-if="isWebSidebarOpen">Games</span>
              <!-- Tooltip for collapsed state -->
              <div 
                v-if="!isWebSidebarOpen"
                class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
              >
                Games
              </div>
            </router-link>

            <router-link 
              to="/userProfile"
              class="flex items-center hover:bg-gray-700 relative group"
              :class="isWebSidebarOpen ? 'px-4 py-2' : 'px-4 py-3 justify-center'"
            >
              <i class="fas fa-user" :class="isWebSidebarOpen ? 'mr-3' : ''"></i>
              <span v-if="isWebSidebarOpen">Member Center</span>
              <!-- Tooltip for collapsed state -->
              <div 
                v-if="!isWebSidebarOpen"
                class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
              >
                Member Center
              </div>
            </router-link>

            <router-link 
              to="/deposit"
              class="flex items-center hover:bg-gray-700 relative group"
              :class="isWebSidebarOpen ? 'px-4 py-2' : 'px-4 py-3 justify-center'"
            >
              <i class="fas fa-money-bill-wave" :class="isWebSidebarOpen ? 'mr-3' : ''"></i>
              <span v-if="isWebSidebarOpen">Deposit</span>
              <!-- Tooltip for collapsed state -->
              <div 
                v-if="!isWebSidebarOpen"
                class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
              >
                Deposit
              </div>
            </router-link>

            <!-- Transaction link hidden -->

            <router-link 
              to="/promotion"
              class="flex items-center hover:bg-gray-700 relative group"
              :class="isWebSidebarOpen ? 'px-4 py-2' : 'px-4 py-3 justify-center'"
            >
              <i class="fas fa-gift" :class="isWebSidebarOpen ? 'mr-3' : ''"></i>
              <span v-if="isWebSidebarOpen">Promotion</span>
              <!-- Tooltip for collapsed state -->
              <div 
                v-if="!isWebSidebarOpen"
                class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
              >
                Promotion
              </div>
            </router-link>

            <router-link 
              to="/wallet"
              class="flex items-center hover:bg-gray-700 relative group"
              :class="isWebSidebarOpen ? 'px-4 py-2' : 'px-4 py-3 justify-center'"
            >
              <i class="fas fa-wallet" :class="isWebSidebarOpen ? 'mr-3' : ''"></i>
              <span v-if="isWebSidebarOpen">Wallet</span>
              <!-- Tooltip for collapsed state -->
              <div 
                v-if="!isWebSidebarOpen"
                class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
              >
                Wallet
              </div>
            </router-link>

            <!-- Show Logout button only if logged in -->
            <button 
              v-if="authState.isLoggedIn"
              @click="handleLogout"
              class="flex items-center w-full text-left hover:bg-gray-700 relative group"
              :class="isWebSidebarOpen ? 'px-4 py-2' : 'px-4 py-3 justify-center'"
            >
              <i class="fas fa-sign-out-alt" :class="isWebSidebarOpen ? 'mr-3' : ''"></i>
              <span v-if="isWebSidebarOpen">Logout</span>
              <!-- Tooltip for collapsed state -->
              <div 
                v-if="!isWebSidebarOpen"
                class="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50"
              >
                Logout
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Mobile Sidebar -->
      <SidebarMenu
        :isOpen="isMobileSidebarOpen"
        :isLoggedIn="authState.isLoggedIn"
        :username="authState.username"
        :menuItems="menuItems"
        @close="toggleMobileSidebar"
        class="md:hidden"
      />

      <!-- Main Content -->
      <div class="flex-1 overflow-auto">
        <main class="p-4 flex-1 overflow-auto">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, computed, ref } from "vue";
import { useRouter, useRoute } from 'vue-router';
import { authState, checkLoginStatus, setLoginState } from "@/store/auth";
import { enableDevMode, isDevModeEnabled } from './store/devAuth';
import AppHeader from "./components/AppHeader.vue";
import SidebarMenu from "./components/SidebarMenu.vue";

export default defineComponent({
  name: "App",
  components: {
    AppHeader,
    SidebarMenu,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // Check login status immediately
    checkLoginStatus();
    
    // Watch for route changes
    watch(() => router.currentRoute.value, () => {
      checkLoginStatus();
    });

    // Check when component is mounted
    onMounted(() => {
      console.log('App mounted');
      
      // Check login status when app loads
      checkLoginStatus();
      
      // Add global handler for image loading errors
      // This will prevent console errors when placeholder images fail to load
      const handleImageError = (e: Event) => {
        if (e.target && e.target instanceof HTMLImageElement) {
          const img = e.target;
          // Replace with a local fallback image or data URI
          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWVlZWUiLz4KPHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmaWxsPSIjOTk5OTk5Ij5JbWFnZTwvdGV4dD4KPC9zdmc+';
          // Prevent further error handling on this image
          img.onerror = null;
        }
      };
      
      // Add the global event listener for all images
      document.addEventListener('error', (e: Event) => {
        if (e.target && e.target instanceof HTMLImageElement) {
          handleImageError(e);
        }
      }, true);
    });
    
    const showHeader = computed(() => {
      // Don't show header on the login and register pages
      const routeName = route.name ? String(route.name) : '';
      return !['login', 'register'].includes(routeName);
    });
    
    const showFooter = computed(() => {
      // Don't show footer on the login and register pages
      const routeName = route.name ? String(route.name) : '';
      return !['login', 'register'].includes(routeName);
    });
    
    const handleLogout = () => {      
      // Clear auth state
      setLoginState(false, '');
      
      // Remove stored tokens
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      
      // Redirect to login page
      router.push('/login');
    };
    
    watch(() => isDevModeEnabled(), (isEnabled) => {
      // Apply dev mode settings when they change
      if (isEnabled) {
        console.log('Dev mode is enabled');
        // Laravel API doesn't need mock API setup
      }
    });
    
    // Create reactive state for sidebars
    const isWebSidebarOpen = ref(true);
    const isMobileSidebarOpen = ref(false);
    
    // Toggle functions
    const toggleWebSidebar = () => {
      isWebSidebarOpen.value = !isWebSidebarOpen.value;
      console.log('Web sidebar toggled:', isWebSidebarOpen.value);
    };
    
    const toggleMobileSidebar = () => {
      isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
      console.log('Mobile sidebar toggled:', isMobileSidebarOpen.value);
    };
    
    return {
      authState,
      handleLogout,
      enableDevMode,
      showHeader,
      showFooter,
      isWebSidebarOpen,
      isMobileSidebarOpen,
      toggleWebSidebar,
      toggleMobileSidebar,
      menuItems: [
        { path: '/', name: 'Games', icon: 'fas fa-gamepad' },
        { path: '/userProfile', name: 'Member Center', icon: 'fas fa-user' },
        { path: '/deposit', name: 'Deposit', icon: 'fas fa-money-bill-wave' },
        // { path: '/transactions', name: 'Transaction', icon: 'fas fa-exchange-alt' }, // Hidden
        { path: '/promotion', name: 'Promotion', icon: 'fas fa-gift' },
        { path: '/wallet', name: 'Wallet', icon: 'fas fa-wallet' }
      ]
    };
  }
});
</script>

<style>
body {
  margin: 0;
  font-family: "Nunito", sans-serif;
}
</style>
