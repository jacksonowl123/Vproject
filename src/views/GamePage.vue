<template>
  <div class="max-w-7xl mx-auto">
    <!-- Hero Banner Carousel -->
    <div class="relative mb-8 w-full rounded-xl overflow-hidden shadow-lg" style="line-height: 0; font-size: 0; margin: 0; padding: 0;">
      <swiper
        :modules="[Autoplay, Pagination]"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="banner-swiper w-full"
        style="aspect-ratio: 3 / 1; line-height: 0; font-size: 0; margin: 0; padding: 0;"
      >
        <swiper-slide v-for="(banner, index) in banners" :key="index" class="banner-slide">
          <div style="width: 100%; height: 100%; line-height: 0; font-size: 0; margin: 0; padding: 0; display: block;">
            <img
              class="banner-image"
              :src="banner"
              :alt="`Banner ${index + 1}`"
              style="display: block; width: 100%; height: 100%; object-fit: fill; object-position: center; margin: 0; padding: 0; line-height: 0; vertical-align: top; border: none; outline: none;"
              loading="lazy"
            />
          </div>
        </swiper-slide>
      </swiper>
    </div>

    <!-- User Balance and Search Section -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
      <div class="w-full md:w-auto">
        <UserBalanceDisplay 
          :initial-balance="userBalance" 
          @balance-updated="handleBalanceUpdate" 
        />
      </div>
      <div class="relative w-full md:w-80">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search for games..." 
          class="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
        />
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
    </div>

    <!-- Game Categories -->
    <div class="mb-8">
      <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-4">Game Categories</h2>
      <div class="flex flex-wrap gap-3 mb-6">
        <button
          @click="filterCategory('all')"
          :class="[
            'rounded-full px-6 py-2 font-medium transition',
            selectedCategory === 'all' 
              ? 'bg-[#0066FF] text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          All Games
        </button>
        <button
          v-for="(count, category) in categoryCount"
          :key="category"
          @click="filterCategory(category)"
          :class="[
            'rounded-full px-6 py-2 font-medium transition flex items-center',
            selectedCategory === category 
              ? 'bg-[#0066FF] text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ formatCategory(category) }}
          <span class="ml-2 bg-white bg-opacity-20 text-xs px-2 py-0.5 rounded-full">{{ count }}</span>
        </button>
      </div>
    </div>

    <!-- Game Cards Grid -->
    <div v-if="displayedGames.length > 0">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        <div
          v-for="game in displayedGames"
          :key="game.id"
          class="group relative rounded-xl overflow-hidden shadow-md transition transform hover:shadow-xl"
        >
          <div class="w-full aspect-[2/3] overflow-hidden bg-gray-100">
            <img
              :src="game.image"
              :alt="game.name"
              :data-expected-path="game.image"
              class="w-full h-full object-cover object-top transition-transform group-hover:scale-110"
              loading="lazy"
              @error="handleImageError"
              @load="() => console.log('✅ Image loaded:', game.name, game.image)"
            />
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 truncate">{{ game.name }}</h3>
            <div class="mt-2 flex justify-between items-center">
              <span class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {{ formatCategory(game.category) }}
              </span>
              <button 
                @click="launchGame(game.id)" 
                class="text-[#0066FF] hover:text-blue-700 font-medium text-sm flex items-center"
              >
                Play <i class="fas fa-play-circle ml-1"></i>
              </button>
            </div>
          </div>
          <!-- Play Button Overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="launchGame(game.id)"
              class="bg-[#0066FF] hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition transform group-hover:scale-105"
            >
              <i class="fas fa-play mr-2"></i> Play Now
            </button>
          </div>
        </div>
      </div>

      <!-- Load More Games Button -->
      <div class="flex justify-center mb-12" v-if="hasMoreGames">
        <button 
          @click="loadMoreGames" 
          class="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-100 transition flex items-center"
        >
          <i class="fas fa-spinner mr-2"></i> Load More Games
        </button>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="flex flex-col items-center justify-center py-16">
      <i class="fas fa-search text-gray-400 text-5xl mb-4"></i>
      <h3 class="text-xl font-medium text-gray-600 mb-2">No Games Found</h3>
      <p class="text-gray-500 mb-6">We couldn't find any games matching your criteria</p>
      <button 
        @click="resetFilters" 
        class="bg-[#0066FF] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Reset Filters
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';
import { laravelApi as api } from '../services/laravelApi';
import Swal from 'sweetalert2';
import { authState } from '@/store/auth';
import UserBalanceDisplay from '../components/UserBalanceDisplay.vue';
import { GAME_IDS, PLATFORM_IDS } from '@/utils/reference-ids';
import { svgPlaceholder } from '@/assets';

export default defineComponent({
  name: 'GamePage',
  components: {
    Swiper,
    SwiperSlide,
    UserBalanceDisplay,
  },
  setup() {
    const router = useRouter();
    const isBalanceVisible = ref(true);
    const selectedCategory = ref('all');
    const searchQuery = ref('');
    const games = ref(api.getGames());
    
    // Pagination settings
    const itemsPerPage = ref(12);
    const currentPage = ref(1);
    
    // Initialize the balance
    const userBalance = ref({
      cash: {
        currency: 'MYR',
        amount: '0.00'
      },
      chips: {
        currency: 'MYR',
        amount: '0.00'
      }
    });

    // Format category names
    const formatCategory = (category: string) => {
      if (!category) return '';
      return category.charAt(0).toUpperCase() + category.slice(1);
    };

    // Reset all filters
    const resetFilters = () => {
      selectedCategory.value = 'all';
      searchQuery.value = '';
      currentPage.value = 1;
    };

    // Filtered games based on category and search
    const filteredGames = computed(() => {
      let filtered = games.value;
      
      // Apply category filter
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(game => game.category === selectedCategory.value);
      }
      
      // Apply search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(game => 
          game.name.toLowerCase().includes(query) || 
          game.category.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    });

    // Paginated games
    const displayedGames = computed(() => {
      const startIndex = 0;
      const endIndex = currentPage.value * itemsPerPage.value;
      return filteredGames.value.slice(startIndex, endIndex);
    });

    // Check if there are more games to load
    const hasMoreGames = computed(() => {
      return displayedGames.value.length < filteredGames.value.length;
    });

    // Load more games
    const loadMoreGames = () => {
      currentPage.value++;
    };

    // Count games in each category
    const categoryCount = computed(() => {
      return games.value.reduce((acc, game) => {
        acc[game.category] = (acc[game.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    });

    // Filter games by category
    function filterCategory(category: string) {
      selectedCategory.value = category;
      currentPage.value = 1; // Reset pagination when changing category
    }

    // Handle image loading errors
    function handleImageError(event: Event) {
      const img = event.target as HTMLImageElement;
      if (!img) return;
      
      const originalSrc = img.src;
      const expectedPath = img.dataset.expectedPath || 'unknown';
      
      console.error('❌ Failed to load game image:', {
        gameName: img.alt,
        attemptedPath: originalSrc,
        expectedPath: expectedPath,
        origin: window.location.origin,
        basePath: '/assets/games/'
      });
      
      // Try alternative paths if the first one fails
      if (originalSrc.includes('/assets/games/')) {
        // Try with different base URL
        const filename = originalSrc.split('/').pop();
        if (filename) {
          // Try direct path from origin
          const altPath = `${window.location.origin}/assets/games/${filename}`;
          console.log('🔄 Trying alternative path:', altPath);
          
          const testImg = new Image();
          testImg.onload = () => {
            console.log('✅ Alternative path worked!');
            img.src = altPath;
            img.onerror = null; // Remove error handler to prevent loop
          };
          testImg.onerror = () => {
            console.error('❌ Alternative path also failed');
            // Final fallback to placeholder
            img.src = svgPlaceholder(300, 200, '#111827', '#FFFFFF', 'Game Image');
            img.onerror = null; // Prevent infinite loop
          };
          testImg.src = altPath;
          return; // Exit early, let the test image handle it
        }
      }
      
      // Final fallback to placeholder
      img.src = svgPlaceholder(300, 200, '#111827', '#FFFFFF', 'Game Image');
      img.onerror = null; // Prevent infinite loop
    }

    // Launch game
    async function launchGame(platformId: number) {
      try {
        // Check if user is logged in
        if (!authState.isLoggedIn) {
          Swal.fire({
            title: 'Login Required',
            text: 'Please log in to play this game',
            icon: 'info',
            confirmButtonColor: '#0066FF',
            showCancelButton: true,
            confirmButtonText: 'Login Now',
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.isConfirmed) {
              router.push('/login');
            }
          });
          return;
        }
        // Use new API: launch by platformId (no mapping)

        // Show loading
        Swal.fire({
          title: 'Launching Game...',
          text: 'Preparing your gaming experience',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        console.log(`Launching game for platform ID: ${platformId}`);
        const response = await api.launchGame(platformId);
        
        // Close loading dialog
        Swal.close();

        const launchUrl = (response as any)?.url || (response as any)?.launch?.Url;
        if (launchUrl) {
          // Open game in a new tab (not a popup window)
          // For mobile compatibility, create an anchor element and click it
          // This is more reliable than window.open() on mobile browsers
          const link = document.createElement('a');
          link.href = launchUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          
          // Append to body temporarily (required for some mobile browsers)
          document.body.appendChild(link);
          
          // Trigger click
          link.click();
          
          // Remove the link element after a short delay
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
          
          // Also try window.open as a backup
          const gameWindow = window.open(launchUrl, '_blank', 'noopener,noreferrer');
          
          // Focus the new tab if window.open succeeded
          if (gameWindow) {
            gameWindow.focus();
          }
        } else {
          throw new Error('Game URL not available');
        }
      } catch (error: any) {
        console.error('Error launching game:', error);
        Swal.close(); // Make sure to close loading dialog on error
        Swal.fire({
          icon: 'error',
          title: 'Failed to Launch Game',
          text: error.message || 'Unable to launch game. Please try again.',
          confirmButtonColor: '#0066FF',
        });
      }
    }

    // Handle balance update
    function handleBalanceUpdate(updatedBalance: any) {
      userBalance.value = updatedBalance;
    }

    // Fetch user balance on mount
    async function fetchUserBalance() {
      if (authState.isLoggedIn) {
        try {
          const userData = await api.getMemberDetails();
          if (userData && userData.account) {
            if (userData.account.cash) {
              userBalance.value.cash = userData.account.cash;
            }
            if (userData.account.chips) {
              userBalance.value.chips = userData.account.chips;
            }
          }
        } catch (error) {
          console.error('Error fetching user balance:', error);
        }
      }
    }

    // Reset pagination when filters change
    watch([selectedCategory, searchQuery], () => {
      currentPage.value = 1;
    });

    // Banner images from Banner 1200x400 folder
    const banners = computed(() => {
      const bannerCount = 8; // We have 8 banner images (1.jpg to 8.jpg)
      return Array.from({ length: bannerCount }, (_, i) => {
        return `/assets/banners/${i + 1}.jpg`;
      });
    });

    onMounted(() => {
      fetchUserBalance();
    });

    return {
      isBalanceVisible,
      selectedCategory,
      games,
      filteredGames,
      displayedGames,
      categoryCount,
      searchQuery,
      currentPage,
      hasMoreGames,
      loadMoreGames,
      resetFilters,
      formatCategory,
      filterCategory,
      launchGame,
      userBalance,
      handleBalanceUpdate,
      handleImageError,
      Autoplay,
      Pagination,
      banners,
    };
  },
});
</script>

<style scoped>
/* Banner carousel styles */
.banner-swiper {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 0 !important;
  font-size: 0 !important;
}

.banner-slide {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 0 !important;
  font-size: 0 !important;
  display: block !important;
}

.banner-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: fill !important;
  object-position: center !important;
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 0 !important;
  vertical-align: top !important;
  border: none !important;
  outline: none !important;
}

.swiper-pagination-bullet {
  background: white !important;
  opacity: 0.7;
}

.swiper-pagination-bullet-active {
  background: #0066FF !important;
  opacity: 1;
}

/* Ensure images maintain quality and don't get pixelated */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: auto;
  max-width: 100%;
  height: auto;
}

/* Ensure object-cover fills the container properly */
.object-cover {
  object-fit: cover !important;
  object-position: center;
}

/* Better positioning for game images - show top portion which usually has important content */
.object-top {
  object-position: top center !important;
}

/* Responsive image containers */
.aspect-\[16\/9\] {
  aspect-ratio: 16 / 9;
}

.aspect-\[4\/3\] {
  aspect-ratio: 4 / 3;
}

.aspect-\[2\/3\] {
  aspect-ratio: 2 / 3;
}

/* Ensure images scale smoothly on different screen sizes */
@media (max-width: 640px) {
  .aspect-\[2\/3\] {
    aspect-ratio: 2 / 3;
  }
}
</style>
