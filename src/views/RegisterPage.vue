<template>
  <div class="flex min-h-screen">
    <!-- Left side - Register Form -->
    <div class="w-1/2 p-8 flex flex-col justify-center">
      <div class="max-w-md mx-auto w-full">
        <!-- Logo -->
        <div class="mb-8">
          <img src="@/assets/logo.png" alt="KK8" class="h-12">
          <h1 class="text-2xl font-bold text-[#0066FF] mt-4">Create Account</h1>
        </div>

        <form @submit.prevent="register">
          <div v-if="error" class="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {{ error }}
          </div>

          <div class="mb-4">
            <input 
              type="text" 
              v-model="username" 
              placeholder="Username"
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

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-[#0066FF] text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-blue-300"
          >
            {{ loading ? 'Creating Account...' : 'Register' }}
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-gray-600">
            Already have an account? 
            <button 
              @click="$router.push('/login')"
              class="text-[#0066FF] font-semibold hover:text-blue-700"
            >
              Login here
            </button>
          </p>
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
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { laravelApi as api } from '@/services/laravelApi';
import { setLoginState } from '@/store/auth';
import Swal from 'sweetalert2';

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const router = useRouter();
    const username = ref('');
    const password = ref('');
    const loading = ref(false);
    const error = ref('');

    // Validate all input fields
    const validateInput = () => {
      if (!username.value.trim()) return 'Username is required';
      if (!password.value.trim()) return 'Password is required';

      // Validate username (min 5 chars, alphanumeric only)
      if (username.value.length < 5) {
        return 'Username must be at least 5 characters long';
      }

      if (!/^[a-zA-Z0-9]+$/.test(username.value)) {
        return 'Username can only contain letters and numbers (no spaces or special characters)';
      }

      // Validate password length
      if (password.value.length < 6) {
        return 'Password must be at least 6 characters long';
      }

      // All validations passed
      return null;
    };

    const register = async () => {
      try {
        loading.value = true;
        error.value = '';

        // Validate input
        const validationError = validateInput();
        if (validationError) {
          error.value = validationError;
          loading.value = false;
          return;
        }

        // Only usr and pwd are required by the new API
        const registerData = {
          usr: username.value,
          pwd: password.value
        };

        console.log('Submitting registration data:', registerData);
        
        const response = await api.createMember(registerData);
        console.log('Registration successful:', response);
        
        // Verify response has required data
        if (!response) {
          throw new Error('Invalid response from server');
        }

        // Show success message
        await Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your account has been created successfully.',
          confirmButtonColor: '#0066FF',
        });

        // Auto login after registration
        try {
          const loginResponse = await api.signInMember(username.value, password.value);
          
        if (!loginResponse || !loginResponse.access_token) {
            throw new Error('Auto-login failed - no access token received');
          }
          
          setLoginState(true, username.value, loginResponse.access_token);
          
          // Fetch member details after login
          const memberDetails = await api.getMemberDetails();
          console.log('Member details after login:', memberDetails);
          
          router.push('/');
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          router.push('/login');
        }
      } catch (err) {
        console.error('Registration error:', err);
        
        // Try to extract the most specific error message
        if (err.message && err.message.includes('username already exists')) {
          error.value = 'This username is already taken. Please choose another one.';
        } else if (err.message && err.message.includes('email already exists')) {
          error.value = 'This email is already registered. Please use a different email.';
        } else if (err.message && err.message.includes('Network Error')) {
          error.value = 'Network error. Please check your internet connection and try again.';
        } else if (err.message && err.message.includes('CORS')) {
          error.value = 'Connection issue. Please try again.';
        } else {
          error.value = err.message || 'Failed to create account. Please try again.';
        }
        
        // Show error message
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: error.value,
          confirmButtonColor: '#0066FF',
        });
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      loading,
      error,
      register
    };
  }
});
</script> 