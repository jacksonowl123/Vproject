<template>
  <div class="api-test p-4 border rounded-lg bg-gray-50">
    <h2 class="text-xl font-bold mb-3">API Connection Test</h2>
    
    <div class="mb-3">
      <p>API URL: <code>{{ apiUrl }}</code></p>
      <p>API Status: <span :class="apiStatus === 'Connected' ? 'text-green-600' : 'text-red-600'">{{ apiStatus }}</span></p>
    </div>
    
    <div class="flex gap-2">
      <button 
        @click="testApiConnection" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="loading"
      >
        {{ loading ? 'Testing...' : 'Test API Connection' }}
      </button>
      
      <button 
        @click="clearLogs" 
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
      >
        Clear Logs
      </button>
    </div>
    
    <div v-if="logs.length > 0" class="mt-4">
      <h3 class="font-bold mb-2">Connection Logs:</h3>
      <div class="bg-gray-800 text-white p-3 rounded overflow-auto max-h-60 font-mono text-sm">
        <div v-for="(log, index) in logs" :key="index" class="mb-1" :class="log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : ''">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import axios from 'axios';

export default defineComponent({
  name: 'ApiTest',
  setup() {
    const apiUrl = ref('/api');
    const apiStatus = ref('Unknown');
    const loading = ref(false);
    const logs = ref<string[]>([]);
    
    const addLog = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      logs.value.push(`[${timestamp}] ${message}`);
    };
    
    const clearLogs = () => {
      logs.value = [];
    };
    
    const testApiConnection = async () => {
      loading.value = true;
      apiStatus.value = 'Testing...';
      
      try {
        addLog('Testing connection to API server...');
        
        // First, try to check if the API endpoint is reachable at all
        addLog(`Sending test request to: ${apiUrl.value}`);
        
        // Creating a simple payload for testing
        const testPayload = {
          payload: btoa(JSON.stringify({ test: true }))
        };
        
        const response = await axios.post('/api', testPayload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });
        
        addLog(`SUCCESS: Received response with status: ${response.status}`);
        addLog(`Response data: ${JSON.stringify(response.data).substring(0, 100)}...`);
        
        apiStatus.value = 'Connected';
      } catch (error: any) {
        addLog(`ERROR: ${error.message}`);
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          addLog(`Response status: ${error.response.status}`);
          addLog(`Response headers: ${JSON.stringify(error.response.headers)}`);
          addLog(`Response data: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
        } else if (error.request) {
          // The request was made but no response was received
          addLog('ERROR: No response received from server');
        } else {
          // Something happened in setting up the request that triggered an Error
          addLog(`ERROR: Failed to send request: ${error.message}`);
        }
        
        apiStatus.value = 'Failed to Connect';
        
        // Try alternative endpoint
        try {
          addLog('Trying alternative connection test...');
          const testResponse = await axios.get(`${apiUrl.value}/ping`, { 
            timeout: 5000 
          });
          addLog(`SUCCESS: Alternative endpoint responded: ${JSON.stringify(testResponse.data)}`);
        } catch (altError: any) {
          addLog(`Alternative test also failed: ${altError.message}`);
        }
      } finally {
        loading.value = false;
      }
    };
    
    return {
      apiUrl,
      apiStatus,
      loading,
      logs,
      testApiConnection,
      clearLogs
    };
  }
});
</script> 