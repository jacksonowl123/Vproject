<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">API Debug & Testing</h1>
    
    <div class="mb-6">
      <ApiTest />
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow">
      <h2 class="text-xl font-bold mb-4">API Configuration</h2>
      
      <div class="mb-4">
        <h3 class="font-bold">Current Settings:</h3>
        <div class="bg-gray-100 p-3 rounded mb-2">
          <p><strong>API Base URL:</strong> {{ apiBaseUrl }}</p>
          <p><strong>Bearer Token Available:</strong> {{ hasBearerToken ? 'Yes' : 'No' }}</p>
          <p><strong>Auth Token Available:</strong> {{ hasAuthToken ? 'Yes' : 'No' }}</p>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <button 
          @click="testRegistration" 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="loading"
        >
          {{ loading ? 'Testing...' : 'Test Registration' }}
        </button>
        
        <button 
          @click="testLogin" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="loading"
        >
          {{ loading ? 'Testing...' : 'Test Login' }}
        </button>
        
        <button 
          @click="clearConsole" 
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Clear Console
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import ApiTest from '@/components/ApiTest.vue';
import { laravelApi as api } from '@/services/laravelApi';

export default defineComponent({
  name: 'ApiDebugView',
  components: {
    ApiTest
  },
  setup() {
    const apiBaseUrl = ref('/api');
    const hasBearerToken = ref(false);
    const hasAuthToken = ref(false);
    const loading = ref(false);
    
    onMounted(() => {
      console.log('API Debug View mounted');
      // Check if auth token exists
      const token = localStorage.getItem('token');
      hasAuthToken.value = !!token;
      
      // Display bearer token status
      hasBearerToken.value = true; // Since it's hardcoded in api.ts
    });
    
    const clearConsole = () => {
      console.clear();
      console.log('Console cleared');
    };
    
    const testRegistration = async () => {
      loading.value = true;
      console.log('Testing registration flow...');
      
      try {
        // Create test user with random suffix to avoid duplicates
        const randomSuffix = Math.floor(Math.random() * 10000);
        const testUser = {
          username: `testuser${randomSuffix}`,
          pwd: 'Test123456',
          mobile: '0123456789',
          name: 'Test User',
          email: `testuser${randomSuffix}@example.com`,
          upline: ''
        };
        
        console.log('Attempting to register test user:', testUser);
        
        const result = await api.createMember(testUser);
        console.log('Registration test result:', result);
        
        alert(`Registration test successful! Username: ${testUser.username}`);
      } catch (error) {
        console.error('Registration test failed:', error);
        alert(`Registration test failed: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };
    
    const testLogin = async () => {
      loading.value = true;
      console.log('Testing login flow...');
      
      try {
        // Try to log in with test credentials
        const testCredentials = {
          username: 'DewaMalaya33',
          password: 'DewaMalaya33',
        };
        
        console.log('Attempting to login with test credentials');
        
        const result = await api.signInMember(testCredentials.username, testCredentials.password);
        console.log('Login test result:', result);
        
        // Update auth token status
        hasAuthToken.value = !!localStorage.getItem('token');
        
        alert('Login test successful!');
      } catch (error) {
        console.error('Login test failed:', error);
        alert(`Login test failed: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };
    
    return {
      apiBaseUrl,
      hasBearerToken,
      hasAuthToken,
      loading,
      clearConsole,
      testRegistration,
      testLogin
    };
  }
});
</script> 