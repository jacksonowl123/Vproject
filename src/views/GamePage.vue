<template>
  <div class="max-w-7xl mx-auto">
    <!-- Hero Banner Carousel -->
    <div class="relative mb-8 rounded-xl overflow-hidden shadow-lg">
      <swiper
        :modules="[Autoplay, Pagination]"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="h-[300px] md:h-[400px]"
      >
        <swiper-slide v-for="i in 4" :key="i" class="relative">
          <img
            class="w-full h-full object-cover"
            :src="bannerPlaceholder"
            :alt="`Banner ${i}`"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div class="p-6 text-white">
              <h2 class="text-2xl md:text-3xl font-bold mb-2">Special Promotion {{ i }}</h2>
              <p class="text-sm md:text-base mb-4">Exclusive games and bonuses available now!</p>
              <button class="bg-[#0066FF] hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
                Learn More
              </button>
            </div>
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
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
    </div>

    <!-- Featured Games Section -->
    <div class="mb-10" v-if="featuredGames.length > 0">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800">Featured Games</h2>
        <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All <i class="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="game in featuredGames.slice(0, 4)"
          :key="`featured-${game.id}`"
          class="relative group rounded-xl overflow-hidden shadow-md transition transform hover:scale-[1.02]"
        >
          <img
            :src="game.image"
            :alt="game.name"
            class="w-full h-48 object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <h3 class="text-white font-bold text-lg mb-2">{{ game.name }}</h3>
            <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded-full inline-block w-fit mb-3">{{ formatCategory(game.category) }}</span>
            <button 
              @click="launchGame(game.id)"
              class="bg-[#0066FF] hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full"
            >
              Play Now
            </button>
          </div>
        </div>
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
          <div class="h-48 overflow-hidden">
            <img
              :src="game.image"
              :alt="game.name"
              class="w-full h-full object-cover transition-transform group-hover:scale-110"
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

    // Featured games (random selection of 4 games)
    const featuredGames = computed(() => {
      return [...games.value].sort(() => 0.5 - Math.random()).slice(0, 8);
    });

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
          // Open game in new window with specific features
          const gameWindow = window.open(
            launchUrl,
            '_blank',
            'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1024,height=768'
          );
          
          // Focus the new window
          if (gameWindow) {
            gameWindow.focus();
          }
        } else {
          throw new Error('Game URL not available');
        }
      } catch (error: any) {
        console.error('Error launching game:', error);
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

    onMounted(() => {
      fetchUserBalance();
    });

    return {
      isBalanceVisible,
      selectedCategory,
      games,
      filteredGames,
      displayedGames,
      featuredGames,
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
      Autoplay,
      Pagination,
      bannerPlaceholder: svgPlaceholder(1200, 400, '#111827', '#FFFFFF', 'Game Banner'),
    };
  },
});
</script>

<style scoped>
.swiper-pagination-bullet {
  background: white !important;
  opacity: 0.7;
}

.swiper-pagination-bullet-active {
  background: #0066FF !important;
  opacity: 1;
}
</style>
