<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Hero Banner Carousel -->
    <div class="relative mb-10 w-full rounded-xl overflow-hidden shadow-lg">
      <swiper
        :modules="[Autoplay, Pagination]"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        :pagination="{ clickable: true }"
        class="banner-swiper h-[300px] md:h-[400px] w-full"
      >
        <swiper-slide v-for="(banner, index) in banners" :key="index" class="banner-slide">
          <img
            class="banner-image w-full h-full object-cover"
            :src="banner"
            :alt="`Promotion Banner ${index + 1}`"
            loading="lazy"
          />
        </swiper-slide>
      </swiper>
    </div>

    <!-- Category Filter Section -->
    <div class="mb-6">
      <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-3">Promotion Categories</h2>
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          @click="selectedCategory = 'all'"
          :class="[
            'rounded-full px-6 py-2 font-medium transition',
            selectedCategory === 'all' 
              ? 'bg-[#0066FF] text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          All Promotions
        </button>
        <button
          v-for="category in promotionCategories"
          :key="category"
          @click="selectedCategory = category === selectedCategory ? 'all' : category"
          :class="[
            'rounded-full px-6 py-2 font-medium transition flex items-center',
            selectedCategory === category 
              ? 'bg-[#0066FF] text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ formatCategory(category) }}
          <span class="ml-2 bg-white bg-opacity-20 text-xs px-2 py-0.5 rounded-full">
            {{ getCategoryCount(category) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-20 flex flex-col items-center justify-center">
      <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-gray-600">Loading promotions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-20 text-center">
      <div class="text-red-500 text-5xl mb-4">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <h3 class="text-xl font-medium text-gray-700 mb-2">Failed to Load Promotions</h3>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <button 
        @click="fetchPromotions" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
      >
        Try Again
      </button>
    </div>

    <!-- Content when data is loaded -->
    <div v-else>
      <!-- Featured Promotion (if any) -->
      <div v-if="featuredPromotion" class="mb-6">
        <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-3">Featured Promotion</h2>
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg overflow-hidden shadow-lg">
          <div class="flex flex-col md:flex-row featured-promotion-wrapper">
            <div 
              class="featured-image-container md:w-1/2"
              @click="showPromotionDetails(featuredPromotion)"
            >
              <img 
                :src="featuredPromotion.image || `/assets/banners/1.jpg`"
                :alt="featuredPromotion.title"
                class="featured-promotion-image"
                loading="lazy"
              />
            </div>
            <div class="p-4 md:w-1/2 flex flex-col justify-center">
              <div class="mb-1.5">
                <span class="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Featured</span>
                <span class="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-2">Limited Time</span>
              </div>
              <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-1.5">{{ featuredPromotion.title }}</h3>
              <p class="text-gray-600 text-xs mb-2 leading-relaxed">{{ featuredPromotion.description }}</p>
              <div class="flex items-center text-xs text-gray-500 mb-2">
                <i class="far fa-calendar-alt mr-1.5"></i> 
                <span>Valid: {{ formatDate(featuredPromotion.endDate) }}</span>
              </div>
              <button 
                @click="showPromotionDetails(featuredPromotion)" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition self-start text-xs"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 class="text-2xl font-bold text-gray-800">All Promotions</h2>
        <div class="relative w-full md:w-80">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search promotions..." 
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <!-- Promotions Grid -->
      <div v-if="filteredPromotions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <div 
          v-for="promotion in filteredPromotions" 
          :key="promotion.id"
          class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition group flex flex-col"
        >
          <div class="relative w-full aspect-[3/1] overflow-hidden" style="line-height: 0; font-size: 0; margin: 0; padding: 0;">
            <img 
              :src="promotion.image || `/assets/banners/${((promotion.id - 1) % 8) + 1}.jpg`"
              :alt="promotion.title"
              class="promotion-card-image"
              style="display: block; margin: 0; padding: 0; width: 100%; height: 100%; object-fit: fill; line-height: 0; vertical-align: top;"
              loading="lazy"
            />
            <div class="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-0.5 m-1.5 rounded-full">
              {{ formatCategory(promotion.category) }}
            </div>
          </div>
          <div class="p-3 flex-1 flex flex-col">
            <h3 class="font-bold text-base mb-1 text-gray-800">{{ promotion.title }}</h3>
            <p class="text-gray-600 text-xs mb-2 line-clamp-2 flex-1 leading-relaxed">{{ promotion.description }}</p>
            <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
              <div class="text-xs text-gray-500">
                <i class="far fa-calendar-alt mr-1"></i> 
                <span class="hidden sm:inline">Valid: </span>{{ formatDate(promotion.endDate) }}
              </div>
              <button 
                @click="showPromotionDetails(promotion)" 
                class="text-blue-600 hover:text-blue-800 text-xs font-medium"
              >
                View <i class="fas fa-chevron-right ml-0.5 text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="py-16 text-center">
        <div class="text-gray-400 text-5xl mb-4">
          <i class="fas fa-gift"></i>
        </div>
        <h3 class="text-xl font-medium text-gray-600 mb-2">No Promotions Found</h3>
        <p class="text-gray-500 mb-6">We couldn't find any promotions matching your criteria</p>
        <button 
          @click="resetFilters" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          Show All Promotions
        </button>
      </div>
    </div>

    <!-- Promotion Detail Modal -->
    <div 
      v-if="selectedPromotion" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="selectedPromotion = null"
    >
      <div class="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="relative w-full aspect-[3/1] overflow-hidden">
          <img 
            :src="selectedPromotion.image || `/assets/banners/1.jpg`"
            :alt="selectedPromotion.title"
            class="w-full h-full object-cover object-center rounded-lg"
            loading="lazy"
          />
          <button 
            @click="selectedPromotion = null" 
            class="absolute top-4 right-4 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-70"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="flex items-center mb-4">
            <span 
              class="bg-blue-600 text-white text-xs px-3 py-1 rounded-full mr-2"
            >
              {{ formatCategory(selectedPromotion.category) }}
            </span>
            <span class="text-sm text-gray-500">
              <i class="far fa-calendar-alt mr-1"></i> 
              Valid until: {{ formatDate(selectedPromotion.endDate) }}
            </span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ selectedPromotion.title }}</h2>
          <div class="prose max-w-none">
            <!-- Show HTML content if available, otherwise show description -->
            <div v-if="selectedPromotion.rawContent" 
                 v-html="selectedPromotion.rawContent" 
                 class="text-gray-700 mb-6 prose max-w-none">
            </div>
            <p v-else class="text-gray-700 mb-4">{{ selectedPromotion.description }}</p>
            
            <!-- Promotion Details (only show if no raw content or for mock data) -->
            <div v-if="!selectedPromotion.rawContent" class="mt-6 mb-8">
              <h3 class="text-lg font-semibold mb-2">Promotion Details:</h3>
              <ul class="list-disc pl-5 space-y-2 text-gray-700">
                <li>Bonus amount: {{ selectedPromotion.bonusAmount || 'Varies based on deposit' }}</li>
                <li>Minimum deposit: {{ selectedPromotion.minDeposit || 'No minimum' }}</li>
                <li>Wagering requirements: {{ selectedPromotion.wageringReq || 'None' }}</li>
                <li>Valid games: {{ selectedPromotion.validGames || 'All games' }}</li>
              </ul>
            </div>

            <!-- Terms and Conditions (only show if no raw content) -->
            <div v-if="!selectedPromotion.rawContent" class="bg-gray-50 p-4 rounded-lg">
              <h3 class="text-lg font-semibold mb-2">Terms & Conditions:</h3>
              <p class="text-sm text-gray-600">
                {{ selectedPromotion.terms || 'Standard promotion terms and conditions apply. Management reserves the right to modify or cancel this promotion at any time. Promotion cannot be combined with other offers.' }}
              </p>
            </div>
          </div>
          
          <div class="mt-8 flex justify-end">
            <button 
              @click="selectedPromotion = null" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 mr-3 hover:bg-gray-100"
            >
              Close
            </button>
            <button 
              v-if="authState.isLoggedIn"
              @click="claimPromotion(selectedPromotion)" 
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Claim This Promotion
            </button>
            <button 
              v-else
              @click="goToLogin" 
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login to Claim
            </button>
          </div>
        </div>
      </div>
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
import { laravelApi as api } from '@/services/laravelApi';
import Swal from 'sweetalert2';
import { authState } from '@/store/auth';
import { svgPlaceholder } from '@/assets';

interface Promotion {
  id: number;
  title: string;
  description: string;
  image?: string;
  category: string;
  featured?: boolean;
  startDate: string;
  endDate: string;
  bonusAmount?: string;
  minDeposit?: string;
  wageringReq?: string;
  validGames?: string;
  terms?: string;
  rawContent?: string; // Original HTML content from CMS
}

export default defineComponent({
  name: 'PromotionPage',
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const error = ref('');
    const promotions = ref<Promotion[]>([]);
    const selectedPromotion = ref<Promotion | null>(null);
    const selectedCategory = ref('all');
    const searchQuery = ref('');

    // Banner images from Banner 1200x400 folder
    const banners = computed(() => {
      const bannerCount = 8; // We have 8 banner images (1.jpg to 8.jpg)
      return Array.from({ length: bannerCount }, (_, i) => {
        return `/assets/banners/${i + 1}.jpg`;
      });
    });

    // Mock promotions for development - will be replaced with API data
    const mockPromotions: Promotion[] = [
      {
        id: 1,
        title: 'Welcome Bonus 100%',
        description: 'Get a 100% bonus on your first deposit up to MYR 388. Start your gaming journey with twice the funds!',
        image: '/assets/banners/1.jpg',
        category: 'welcome',
        featured: true,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        bonusAmount: '100% up to MYR 388',
        minDeposit: 'MYR 50',
        wageringReq: '20x Bonus Amount',
        validGames: 'All Slots, Table Games',
        terms: 'New players only. One bonus per player. Minimum deposit MYR 50. Maximum bonus MYR 388. Wagering requirements 20x bonus amount. Bonus expires after 30 days.'
      },
      {
        id: 2,
        title: 'Weekend Reload 50%',
        description: 'Every weekend, reload your account with a 50% bonus up to MYR 200. Play more on weekends!',
        image: '/assets/banners/2.jpg',
        category: 'reload',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        bonusAmount: '50% up to MYR 200',
        minDeposit: 'MYR 30',
        wageringReq: '15x Bonus Amount',
      },
      {
        id: 3,
        title: 'Daily Free Spins',
        description: 'Get 10 free spins every day on selected slot games when you deposit at least MYR 50.',
        image: '/assets/banners/3.jpg',
        category: 'freespins',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      },
      {
        id: 4,
        title: 'VIP Cashback Program',
        description: 'VIP players receive up to 15% weekly cashback on net losses. The higher your VIP level, the more cashback you receive!',
        image: '/assets/banners/4.jpg',
        category: 'vip',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      },
      {
        id: 5,
        title: 'Refer a Friend Bonus',
        description: 'Refer a friend and receive MYR 50 when they make their first deposit. Your friend also gets an extra 10% bonus!',
        image: '/assets/banners/5.jpg',
        category: 'referral',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      },
      {
        id: 6,
        title: 'Tournament Tuesday',
        description: 'Join our weekly slot tournament every Tuesday and compete for a prize pool of MYR 1,000!',
        image: '/assets/banners/7.jpg',
        category: 'tournament',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      },
      {
        id: 7,
        title: 'Live Dealer Cashback',
        description: 'Play on any Live Dealer games and get 10% cashback on net losses, up to MYR 100 daily.',
        image: '/assets/banners/8.jpg',
        category: 'cashback',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      },
      {
        id: 8,
        title: 'Mobile Monday Bonus',
        description: 'Play on mobile every Monday and get a 25% deposit bonus up to MYR 100.',
        image: '/assets/banners/4.jpg',
        category: 'mobile',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      }
    ];

    // Format date
    const formatDate = (dateString: string): string => {
      if (!dateString) return 'Ongoing';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Format category name
    const formatCategory = (category: string): string => {
      if (!category) return '';
      
      // Handle common categories
      switch (category.toLowerCase()) {
        case 'welcome': return 'Welcome Bonus';
        case 'reload': return 'Reload Bonus';
        case 'freespins': return 'Free Spins';
        case 'vip': return 'VIP Bonus';
        case 'referral': return 'Referral';
        case 'tournament': return 'Tournament';
        case 'cashback': return 'Cashback';
        case 'mobile': return 'Mobile Bonus';
        case 'all': return 'All Promotions';
        default: return category.charAt(0).toUpperCase() + category.slice(1);
      }
    };

    // Get all available promotion categories
    const promotionCategories = computed(() => {
      const categories = promotions.value.map(p => p.category);
      return [...new Set(categories)];
    });

    // Get count of promotions in a category
    const getCategoryCount = (category: string): number => {
      return promotions.value.filter(p => p.category === category).length;
    };

    // Get featured promotion
    const featuredPromotion = computed(() => {
      return promotions.value.find(p => p.featured);
    });

    // Filter promotions by category and search query
    const filteredPromotions = computed(() => {
      let filtered = promotions.value;
      
      // Filter by category
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(p => p.category === selectedCategory.value);
      }
      
      // Filter by search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }
      
      // Remove featured promotion to avoid duplication
      if (featuredPromotion.value) {
        filtered = filtered.filter(p => p.id !== featuredPromotion.value?.id);
      }
      
      return filtered;
    });

    // Reset all filters
    const resetFilters = () => {
      selectedCategory.value = 'all';
      searchQuery.value = '';
    };

    // Show promotion details in modal
    const showPromotionDetails = (promotion: Promotion) => {
      selectedPromotion.value = promotion;
    };

    // Navigate to login page
    const goToLogin = () => {
      router.push('/login');
      selectedPromotion.value = null;
    };

    // Claim the promotion
    const claimPromotion = async (promotion: Promotion) => {
      try {
        const result = await Swal.fire({
          title: 'Claim Promotion',
          html: `
            <div class="text-left">
              <p class="mb-4">Are you sure you want to claim this promotion?</p>
              <div class="bg-blue-50 p-3 rounded-lg">
                <h4 class="font-semibold text-blue-800">${promotion.title}</h4>
                <p class="text-sm text-blue-600">${promotion.description}</p>
                ${promotion.bonusAmount ? `<p class="text-sm text-blue-600 mt-2"><strong>Bonus:</strong> ${promotion.bonusAmount}</p>` : ''}
              </div>
            </div>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#0066FF',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, claim it!',
          cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
          // Show loading
          Swal.fire({
            title: 'Processing...',
            text: 'Claiming your promotion',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Call the real API to claim promotion
          const response = await api.claimPromotion(promotion.id);
          
          if (!response.success) {
            throw new Error(response.message || 'Failed to claim promotion');
          }
          
          const bonusAmount = response.data.bonusAmount;
          
          Swal.fire({
            title: 'Promotion Claimed Successfully!',
            html: `
              <div class="text-center">
                <div class="text-6xl text-green-500 mb-4">🎉</div>
                <h3 class="text-lg font-semibold mb-2">${promotion.title}</h3>
                <div class="bg-green-50 p-4 rounded-lg mb-4">
                  <p class="text-green-700">
                    <strong>MYR ${bonusAmount.toFixed(2)}</strong> has been added to your Bonus Balance!
                  </p>
                </div>
                <p class="text-sm text-gray-600">
                  Check your wallet to see the updated bonus balance.
                </p>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#0066FF',
            confirmButtonText: 'View Wallet'
          }).then((result) => {
            if (result.isConfirmed) {
              router.push('/wallet');
            }
          });

          selectedPromotion.value = null;
        }
      } catch (error) {
        console.error('Error claiming promotion:', error);
        Swal.fire({
          title: 'Claim Failed',
          text: 'There was an error claiming your promotion. Please try again later.',
          icon: 'error',
          confirmButtonColor: '#0066FF'
        });
      }
    };

    // Fetch promotions from API
    const fetchPromotions = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        // Fetch CMS content from API
        const response = await api.getCmsContent();
        
        if (response.success && response.data && Array.isArray(response.data)) {
          // Transform CMS data to promotion format
          promotions.value = response.data.map((item: any, index: number) => ({
            id: item.iid || index + 1,
            title: item.title || 'Promotion',
            description: item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'No description available',
            image: item.urlbanner || '',
            category: 'promotion', // Default category, could be extracted from content or added to CMS
            featured: index === 0, // Make first promotion featured
            startDate: '2023-01-01', // Could be added to CMS data
            endDate: '2024-12-31', // Could be added to CMS data
            bonusAmount: 'See details', // Could be extracted from content
            minDeposit: 'See terms',
            wageringReq: 'See terms',
            validGames: 'See terms',
            terms: item.content || 'Standard terms and conditions apply.',
            rawContent: item.content // Store original HTML content
          }));

          // If no CMS data available, fallback to mock data
          if (promotions.value.length === 0) {
            console.log('No CMS data available, using mock data');
            promotions.value = mockPromotions;
          }
        } else {
          console.log('Invalid CMS response, using mock data');
        promotions.value = mockPromotions;
        }
      } catch (err: any) {
        console.error('Error fetching promotions:', err);
        console.log('API error, using mock data as fallback');
        // Fallback to mock data if API fails
        promotions.value = mockPromotions;
        // Don't show error to user, just use mock data
        // error.value = err.message || 'Failed to load promotions. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    // Reset category when search query changes
    watch(searchQuery, () => {
      if (searchQuery.value && selectedCategory.value !== 'all') {
        selectedCategory.value = 'all';
      }
    });

    // Fetch promotions on component mount
    onMounted(() => {
      fetchPromotions();
    });

    return {
      loading,
      error,
      promotions,
      selectedPromotion,
      selectedCategory,
      searchQuery,
      featuredPromotion,
      filteredPromotions,
      promotionCategories,
      formatCategory,
      formatDate,
      resetFilters,
      showPromotionDetails,
      goToLogin,
      claimPromotion,
      fetchPromotions,
      authState,
      banners,
      getCategoryCount,
      Autoplay,
      Pagination
    };
  }
});
</script>

<style scoped>
/* Banner carousel styles */
.banner-swiper {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.banner-slide {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.banner-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
}

.swiper-pagination-bullet {
  background: white !important;
  opacity: 0.7;
}

.swiper-pagination-bullet-active {
  background: #0066FF !important;
  opacity: 1;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Styling for CMS HTML content */
.prose :deep(h1) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.prose :deep(h2) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.prose :deep(h3) {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.prose :deep(ul), .prose :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  margin-bottom: 0.25rem;
}

.prose :deep(strong) {
  font-weight: bold;
}

.prose :deep(em) {
  font-style: italic;
}

.prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.prose :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.prose :deep(a:hover) {
  color: #1d4ed8;
}

/* Ensure images maintain aspect ratio and don't get cropped */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: auto;
  max-width: 100%;
  height: auto;
}

/* Aspect ratio for consistent card sizing - matches banner images (1200x400 = 3:1) */
.aspect-\[3\/1\] {
  aspect-ratio: 3 / 1;
}

/* Remove all gaps from promotion card images */
.relative.aspect-\[3\/1\] {
  padding: 0 !important;
  margin: 0 !important;
  line-height: 0 !important;
  font-size: 0 !important;
}

.promotion-card-image {
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: fill !important;
  vertical-align: top !important;
  line-height: 0 !important;
  border: none !important;
  outline: none !important;
}

/* Remove visual gaps from featured promotion image only - keep clickable areas */
.featured-promotion-wrapper {
  gap: 0 !important;
  margin: 0 !important;
}

.featured-image-container {
  padding: 0 !important;
  margin: 0 !important;
  line-height: 0 !important;
  font-size: 0 !important;
  display: block !important;
  width: 100% !important;
  aspect-ratio: 3 / 1 !important;
  overflow: hidden !important;
  cursor: pointer; /* Make image clickable */
}

.featured-image-container:hover {
  opacity: 0.95; /* Visual feedback on hover */
}

.featured-promotion-image {
  display: block !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: fill !important;
  border: none !important;
  outline: none !important;
  line-height: 0 !important;
  vertical-align: top !important;
  font-size: 0 !important;
  pointer-events: auto; /* Ensure image is clickable */
}

/* Remove gap between image and content in flex container - but keep content padding */
.featured-promotion-wrapper > .featured-image-container {
  margin-bottom: 0 !important;
  margin-top: 0 !important;
  flex-shrink: 0 !important;
}

.featured-promotion-wrapper > .featured-image-container + div {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  /* Keep padding for text content - don't remove this! */
}

/* On mobile (flex-col), remove gap between image and text */
@media (max-width: 768px) {
  .featured-promotion-wrapper.flex-col > .featured-image-container {
    margin-bottom: 0 !important;
  }
  
  .featured-promotion-wrapper.flex-col > .featured-image-container + div {
    margin-top: 0 !important;
  }
}

/* Ensure images fill containers properly */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: auto;
}
</style>
