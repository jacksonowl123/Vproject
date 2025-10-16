<template>
  <form @submit.prevent="handleLogin" class="space-y-4">
    <div>
      <input 
        v-model="username"
        type="text"
        placeholder="Username"
        class="w-full p-2 border rounded"
      />
    </div>
    <div>
      <input 
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full p-2 border rounded"
      />
    </div>
    <button 
      :disabled="isLoading"
      type="submit"
      class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
    >
      <span v-if="isLoading">Loading...</span>
      <span v-else>Login</span>
    </button>
    <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { laravelApi as api } from '@/services/laravelApi';
import { setLoginState, authState } from '@/store/auth';

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // Initialize with query params if available
    const username = ref(route.query.username?.toString() || '');
    const password = ref('');
    const error = ref('');
    const isLoading = ref(false);

    // Auto login if coming from registration
    onMounted(async () => {
      if (route.query.autoLogin === 'true' && username.value) {
        // You might want to show a message that auto-login is happening
        try {
          isLoading.value = true;
          const response = await api.signInMember(username.value, password.value);
          setLoginState(true, username.value, response.access_token);
          await router.push('/');
        } catch (error: any) {
          console.error('Auto-login error:', error);
        } finally {
          isLoading.value = false;
        }
      }
    });

    return { router, authState };
  },
  data() {
    return {
      username: '',
      password: '',
      error: '',
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        this.error = 'Both username and password are required.';
        return;
      }
      this.isLoading = true;
      try {
        this.error = '';
        const response = await api.signInMember(this.username, this.password);
        console.log('Login successful:', response);
        
        // Set login state with token
        setLoginState(true, this.username, response.access_token);
        
        // Navigate without reload
        await this.router.push('/');
      } catch (error: any) {
        console.error('Login error:', error);
        
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
          } else if (error.message.toLowerCase().includes('member inactive')) {
            userFriendlyMessage = "Your account is currently inactive. Please contact support for assistance.";
          } else if (error.message.toLowerCase().includes('invalid')) {
            userFriendlyMessage = "Invalid username or password. Please check your credentials.";
          }
        }
        
        this.error = userFriendlyMessage;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script> 