<template>
  <!-- Desktop View -->
  <div class="hidden md:flex min-h-screen">
    <!-- Left side - Login Form -->
    <div class="w-1/2 p-8 flex flex-col justify-center">
      <div class="max-w-md mx-auto w-full">
        <!-- Logo -->
        <div class="mb-8">
          <img :src="dummyImages.logo" alt="KK8" class="h-12">
          <h1 class="text-2xl font-bold text-[#0066FF] mt-4">Welcome Back</h1>
        </div>

        <!-- Login Form -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Login</h2>
          <p class="text-gray-600 mb-6">Log in to continue your experience with KK8 application.</p>
        </div>

        <form @submit.prevent="login">
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 flex items-start">
            <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <span>{{ error }}</span>
          </div>

          <div class="mb-4">
            <input 
              type="text" 
              v-model="username" 
              placeholder="UID*"
              class="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          <div class="mb-4">
            <input 
              type="password" 
              v-model="password" 
              placeholder="Password"
              class="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
              required
            />
          </div>

          <div class="flex items-center mb-6">
            <input 
              type="checkbox" 
              id="remember" 
              v-model="rememberMe"
              class="mr-2"
            />
            <label for="remember" class="text-gray-600">Remember Me</label>
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-[#0066FF] text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-blue-300"
          >
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>

        <div class="mt-6 flex justify-between text-sm">
          <a href="#" class="text-gray-600 hover:text-blue-600">Forgot UID?</a>
          <a href="#" class="text-gray-600 hover:text-blue-600">Forgot Password?</a>
        </div>

        <div class="mt-8">
          <button 
            @click="$router.push('/register')" 
            class="w-full border-2 border-[#0066FF] text-[#0066FF] py-3 rounded-lg font-semibold hover:bg-blue-50"
          >
            Register
          </button>
        </div>

        <div class="mt-4 flex justify-end">
          <router-link to="/api-test" class="text-xs text-gray-500 hover:text-blue-500">
            Test API Connection
          </router-link>
        </div>
      </div>
    </div>

    <!-- Right side - Promo Section -->
    <div class="w-1/2 bg-[#0066FF]">
      <div class="h-full flex items-center justify-center p-8">
        <div class="text-center text-white">
          <h2 class="text-4xl font-bold mb-4">JOIN US TODAY</h2>
          <h3 class="text-5xl font-bold mb-4">Start Your Journey</h3>
          <p class="text-xl">Experience premium gaming and exclusive features</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile View -->
  <div class="md:hidden min-h-screen bg-white pb-20">
    <!-- Slider/Banner Section -->
    <div class="relative h-48 bg-blue-600">
      <swiper
        :modules="[SwiperAutoplay, SwiperPagination]"
        :autoplay="{ delay: 3000 }"
        :pagination="{ clickable: true }"
        class="h-full"
      >
        <swiper-slide>
          <div class="h-full flex items-center justify-center text-white">
            <img :src="dummyImages.bannerImage" alt="Lucky 365" class="w-full h-full object-cover absolute inset-0">
            <div class="relative z-10">
              <h2>Lucky 365</h2>
              <h3>Treasure Hunter</h3>
              <button class="bg-yellow-400 px-4 py-2 rounded-full">READ MORE</button>
            </div>
          </div>
        </swiper-slide>
        <!-- Add more slides as needed -->
      </swiper>
    </div>

    <!-- Login Form -->
    <div class="px-6 py-8">
      <h1 class="text-xl font-bold mb-2">Login</h1>
      <p class="text-gray-600 mb-6">Log in to continue your experience with KK8 application.</p>
      
      <form @submit.prevent="login">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 flex items-start">
          <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span>{{ error }}</span>
        </div>

        <div class="mb-4">
          <input 
            type="text" 
            v-model="username" 
            placeholder="UID*"
            class="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 placeholder-gray-400"
          />
        </div>

        <div class="mb-4">
          <input 
            type="password" 
            v-model="password" 
            placeholder="Password"
            class="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 placeholder-gray-400"
          />
        </div>

        <div class="flex items-center mb-6">
          <input type="checkbox" id="remember" v-model="rememberMe" class="mr-2" />
          <label for="remember" class="text-gray-600">Remember Me</label>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          {{ loading ? 'Logging in...' : 'Log In' }}
        </button>
      </form>

      <div class="mt-6 flex justify-between text-sm">
        <a href="#" class="text-blue-600">Forgot UID</a>
        <span class="text-gray-400">or</span>
        <a href="#" class="text-blue-600">Password?</a>
      </div>

      <div class="mt-6">
        <p class="text-center text-gray-600">
          Don't have an account? 
          <router-link to="/register" class="text-blue-600 font-semibold">
            Create Account
          </router-link>
        </p>
      </div>

      <!-- Guide Section -->
      <div class="mt-8">
        <h2 class="text-lg font-bold mb-4">KK8 Login: A Comprehensive Guide</h2>
        <p class="text-gray-600">
          KK8 is a <span class="text-blue-600">trusted online casino</span> platform that is suitable for all kinds of players. It offers a wide variety of games, including slots, table games, live dealer games, and sports betting. Let's login KK8 account now to enjoy all the casino games.
        </p>
        <a href="#" class="text-blue-600 mt-2 inline-block">Read more ></a>
      </div>

      <div class="mt-4 flex justify-end">
        <router-link to="/api-test" class="text-xs text-gray-500 hover:text-blue-500">
          Test API Connection
        </router-link>
      </div>
    </div>

    <!-- Mobile Footer -->
    <MobileFooter />
  </div>
</template>

<script>
import { laravelApi as api } from "@/services/laravelApi";
import { setLoginState } from "@/store/auth";
import Swal from 'sweetalert2';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import MobileFooter from '@/components/MobileFooter.vue';
import { dummyImages } from '@/assets';
import 'swiper/css';
import 'swiper/css/pagination';

export default {
  name: 'LoginPage',
  components: {
    Swiper,
    SwiperSlide,
    MobileFooter
  },
  setup() {
    return {
      SwiperAutoplay: Autoplay,
      SwiperPagination: Pagination
    }
  },
  data() {
    return {
      username: "",
      password: "",
      rememberMe: false,
      loading: false,
      error: null,
      dummyImages
    };
  },
  methods: {
    validateForm() {
      this.error = null;
      
      if (!this.username.trim()) {
        this.error = "Username is required";
        return false;
      }
      
      if (!this.password.trim()) {
        this.error = "Password is required";
        return false;
      }
      
      if (this.username.trim().length < 3) {
        this.error = "Username must be at least 3 characters long";
        return false;
      }
      
      if (this.password.length < 6) {
        this.error = "Password must be at least 6 characters long";
        return false;
      }
      
      return true;
    },
    
    async login() {
      if (!this.validateForm()) return;
      
      this.loading = true;
      
      try {
        console.log('Attempting login with username:', this.username);
        const response = await api.signInMember(this.username, this.password);
        
        // Validate the response
        if (!response || !response.access_token) {
          throw new Error('Invalid response from server - no access token received');
        }
        
        console.log('Login successful, access token received');
        
        // Set login state with token
        setLoginState(true, this.username, response.access_token);
        
        if (this.rememberMe) {
          localStorage.setItem('remember_username', this.username);
        } else {
          localStorage.removeItem('remember_username');
        }
        
        await Swal.fire({
          icon: 'success',
          title: 'Welcome back!',
          text: 'You have successfully logged in.',
          timer: 1500,
          showConfirmButton: false
        });
        
        this.$router.push('/');
      } catch (error) {
        console.error("Login failed:", error);
        
        // Parse and format user-friendly error messages
        let userFriendlyMessage = "Login failed. Please try again.";
        
        // Handle API response errors
        if (error.response?.data) {
          const errorData = error.response.data;
          
          // Check for specific API error responses
          if (typeof errorData === 'string') {
            // Handle string responses that might contain JSON
            try {
              const parsedError = JSON.parse(errorData);
              if (parsedError.error_description) {
                if (parsedError.error_description.toLowerCase().includes('member inactive')) {
                  userFriendlyMessage = "Your account is currently inactive. Please contact support for assistance.";
                } else if (parsedError.error_description.toLowerCase().includes('invalid')) {
                  userFriendlyMessage = "Invalid username or password. Please check your credentials.";
                } else {
                  userFriendlyMessage = "Authentication failed. Please check your username and password.";
                }
              } else if (parsedError.error === 'invalid_grant') {
                userFriendlyMessage = "Invalid username or password. Please check your credentials.";
              }
            } catch (parseError) {
              // If it's not JSON, check for common error patterns
              if (errorData.toLowerCase().includes('member inactive')) {
                userFriendlyMessage = "Your account is currently inactive. Please contact support for assistance.";
              } else if (errorData.toLowerCase().includes('invalid')) {
                userFriendlyMessage = "Invalid username or password. Please check your credentials.";
              }
            }
          } else if (errorData.message) {
            // Handle Laravel API response format
            if (errorData.message.toLowerCase().includes('member inactive')) {
              userFriendlyMessage = "Your account is currently inactive. Please contact support for assistance.";
            } else if (errorData.message.toLowerCase().includes('invalid') || errorData.message.toLowerCase().includes('unauthorized')) {
              userFriendlyMessage = "Invalid username or password. Please check your credentials.";
            } else {
              userFriendlyMessage = errorData.message;
            }
          } else if (errorData.error_description) {
            if (errorData.error_description.toLowerCase().includes('member inactive')) {
              userFriendlyMessage = "Your account is currently inactive. Please contact support for assistance.";
            } else if (errorData.error_description.toLowerCase().includes('invalid')) {
              userFriendlyMessage = "Invalid username or password. Please check your credentials.";
            } else {
              userFriendlyMessage = "Authentication failed. Please check your username and password.";
            }
          }
        } else if (error.message) {
          // Handle other types of errors
          if (error.message.includes('no access token received')) {
            userFriendlyMessage = "Invalid username or password. Please check your credentials.";
        } else if (error.message.includes('CORS')) {
            userFriendlyMessage = "Connection issue. Please try again.";
        } else if (error.message.includes('Network Error')) {
            userFriendlyMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes('522') || error.message.includes('timeout')) {
            userFriendlyMessage = "Connection timeout. Please try again in a few moments.";
          
          // Show a more detailed error message for 522 errors
          Swal.fire({
            icon: 'error',
            title: 'Connection Timeout',
            html: `
                <p>The server is currently experiencing connection issues.</p>
              <p class="mt-2">Please try one of the following:</p>
              <ul class="text-left mt-2 mx-auto" style="max-width: 300px;">
                <li>• Wait a few minutes and try again</li>
                <li>• Check your internet connection</li>
                <li>• Try using a different network</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            `,
            confirmButtonColor: '#0066FF',
          });
          
          this.loading = false;
          return;
          } else if (error.message.toLowerCase().includes('member inactive')) {
            userFriendlyMessage = "Your account is currently inactive. Please contact support for assistance.";
          } else if (error.message.toLowerCase().includes('invalid')) {
            userFriendlyMessage = "Invalid username or password. Please check your credentials.";
        }
        }
        
        this.error = userFriendlyMessage;
        
        // Show error alert with user-friendly message
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: userFriendlyMessage,
          confirmButtonColor: '#0066FF',
        });
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    // Check if we should remember the username
    const rememberedUsername = localStorage.getItem('remember_username');
    if (rememberedUsername) {
      this.username = rememberedUsername;
      this.rememberMe = true;
    }
  }
};
</script> 