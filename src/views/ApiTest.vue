<template>
  <div class="api-test p-4 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">API Connectivity Test</h1>
    
    <div class="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">API Connection Status</h2>
      
      <div class="mb-4">
        <div class="flex items-center">
          <span class="mr-2">Connection Status:</span>
          <span 
            class="px-2 py-1 rounded text-sm font-medium"
            :class="{
              'bg-green-100 text-green-800': isConnected,
              'bg-red-100 text-red-800': isConnected === false,
              'bg-yellow-100 text-yellow-800': isConnected === null
            }"
          >
            {{ isConnected === null ? 'Not Tested' : isConnected ? 'Connected' : 'Failed' }}
          </span>
        </div>
        <p class="text-sm text-gray-600 mt-1">{{ connectionMessage }}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">API URL</label>
          <input 
            v-model="apiUrl" 
            type="text" 
            class="w-full p-2 border rounded"
            placeholder="Enter API URL"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
          <input 
            v-model="accessToken" 
            type="text" 
            class="w-full p-2 border rounded"
            placeholder="Enter access token"
          />
        </div>
      </div>
      
      <div class="flex space-x-2">
        <button 
          @click="testConnection" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :disabled="isLoading"
        >
          <span v-if="isLoading">
            <i class="fas fa-spinner fa-spin mr-2"></i> Testing...
          </span>
          <span v-else>
            Test Connection
          </span>
        </button>
        
        <button 
          @click="useDefaults" 
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          :disabled="isLoading"
        >
          Use Defaults
        </button>
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-4">Test API Endpoints</h2>
      
      <div class="space-y-4">
        <div>
          <h3 class="font-medium mb-2">Headers</h3>
          <pre class="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{{ JSON.stringify(getHeaders(), null, 2) }}</pre>
        </div>
        
        <div>
          <h3 class="font-medium mb-2">Available Endpoints</h3>
          <div class="space-y-2">
            <button 
              v-for="endpoint in testEndpoints" 
              :key="endpoint.name"
              @click="testEndpoint(endpoint)"
              class="w-full text-left p-3 border rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="isEndpointLoading"
            >
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-medium">{{ endpoint.name }}</span>
                  <p class="text-sm text-gray-600">{{ endpoint.description }}</p>
                </div>
                <span 
                  v-if="endpoint.status" 
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': endpoint.status === 'success',
                    'bg-red-100 text-red-800': endpoint.status === 'failed'
                  }"
                >
                  {{ endpoint.status }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="responseData" class="bg-white p-4 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Response Data</h2>
      <pre class="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{{ JSON.stringify(responseData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue';
import { laravelApi as api } from '../services/laravelApi';

export default defineComponent({
  name: 'ApiTest',
  
  setup() {
    const isLoading = ref(false);
    const isEndpointLoading = ref(false);
    const isConnected = ref<boolean | null>(null);
    const connectionMessage = ref('Click "Test Connection" to begin testing');
    const responseData = ref<any>(null);
    
    // API configuration
    const apiUrl = ref('https://office.86now.online/api');
    const accessToken = ref('eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJRQmV0NjYiLCJhdWQiOiIyIiwiaXNzIjoiYWRtaW4ucWJldDY2LmNvbSIsImV4cCI6MTcxODgxOTUxOCwiaWF0IjoxNzE4NzMzMTE4LCJpcHMiOiIiLCJqdGkiOiI3NDkifQ.8_wZbYQWpihLiqOLNRIGAzgVj6ekrENr_nZ5n0Al1XdsN3TJsildqAuz5BPEmqqp_puCOElDGjdV0-Ye6widUw');
    
    // Test endpoints
    const testEndpoints = reactive([
      {
        name: 'Simple API Ping',
        endpoint: '',
        method: 'GET',
        description: 'Test a basic GET request to the API',
        status: null as string | null
      },
      {
        name: 'Get Member Details',
        endpoint: 'members.whoami',
        method: 'POST',
        description: 'Get current authenticated member details',
        status: null as string | null
      },
      {
        name: 'Get Incentives',
        endpoint: 'incentives.incentives',
        method: 'POST',
        description: 'Get available bonus incentives',
        status: null as string | null
      },
      {
        name: 'Get Transactions',
        endpoint: 'transactions.list',
        method: 'POST',
        description: 'Get transaction history for the current user',
        status: null as string | null
      }
    ]);
    
    // Helper to get headers
    const getHeaders = () => {
      return {
        'Authorization': `Bearer ${accessToken.value}`,
        'Content-Type': 'application/json'
      };
    };
    
    // Test API connection
    const testConnection = async () => {
      isLoading.value = true;
      connectionMessage.value = 'Testing API connection...';
      
      try {
        // First test: Simple GET request
        try {
          const response = await fetch(apiUrl.value, {
            method: 'GET',
            headers: getHeaders()
          });
          
          if (response.ok) {
            isConnected.value = true;
            connectionMessage.value = `Successfully connected to API (GET): ${response.status} ${response.statusText}`;
            return;
          } else {
            connectionMessage.value = `GET request failed: ${response.status} ${response.statusText}`;
          }
        } catch (error) {
          console.error('GET request error:', error);
          connectionMessage.value = `GET request error: ${error instanceof Error ? error.message : String(error)}`;
        }
        
        // Second test: POST request
        try {
          const response = await fetch(apiUrl.value, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({})
          });
          
          if (response.ok) {
            isConnected.value = true;
            connectionMessage.value = `Successfully connected to API (POST): ${response.status} ${response.statusText}`;
            return;
          } else {
            connectionMessage.value = `POST request failed: ${response.status} ${response.statusText}`;
          }
        } catch (error) {
          console.error('POST request error:', error);
          connectionMessage.value = `POST request error: ${error instanceof Error ? error.message : String(error)}`;
        }
        
        // Try using the API service methods
        try {
          const connected = await api.testApiConnectivity();
          
          if (connected) {
            isConnected.value = true;
            connectionMessage.value = 'Successfully connected to API using the API service';
            return;
          } else {
            connectionMessage.value = 'API service connectivity test failed';
          }
        } catch (error) {
          console.error('API service error:', error);
          connectionMessage.value = `API service error: ${error instanceof Error ? error.message : String(error)}`;
        }
        
        // If we get here, all tests failed
        isConnected.value = false;
        connectionMessage.value = 'All connection attempts failed. Check console for details.';
        
      } finally {
        isLoading.value = false;
      }
    };
    
    // Test specific endpoint
    const testEndpoint = async (endpoint: typeof testEndpoints[0]) => {
      if (isEndpointLoading.value) return;
      
      isEndpointLoading.value = true;
      responseData.value = null;
      
      try {
        if (endpoint.method === 'GET') {
          const response = await fetch(`${apiUrl.value}/${endpoint.endpoint}`, {
            method: 'GET',
            headers: getHeaders()
          });
          
          if (response.ok) {
            const data = await response.json();
            responseData.value = data;
            endpoint.status = 'success';
          } else {
            responseData.value = {
              error: true,
              status: response.status,
              statusText: response.statusText
            };
            endpoint.status = 'failed';
          }
        } else {
          // For POST endpoints
          const requestBody: any = {};
          
          // Special handling for different endpoints
          if (endpoint.endpoint === 'members.whoami') {
            requestBody.endpoint = 'members.whoami';
            requestBody.payload = btoa(JSON.stringify({}));
          } else if (endpoint.endpoint === 'incentives.incentives') {
            requestBody.endpoint = 'incentives.incentives';
            requestBody.payload = btoa(JSON.stringify({}));
          } else if (endpoint.endpoint === 'transactions.list') {
            // Set start date to 30 days ago
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            const formattedStartDate = startDate.toISOString().split('T')[0];
            
            // Set end date to today
            const endDate = new Date().toISOString().split('T')[0];
            
            requestBody.endpoint = 'transactions.list';
            requestBody.payload = btoa(JSON.stringify({
              startDate: formattedStartDate,
              endDate: endDate
            }));
          } else {
            requestBody.endpoint = endpoint.endpoint;
            requestBody.payload = btoa(JSON.stringify({}));
          }
          
          const response = await fetch(apiUrl.value, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(requestBody)
          });
          
          if (response.ok) {
            const data = await response.json();
            responseData.value = data;
            endpoint.status = 'success';
          } else {
            const errorText = await response.text();
            try {
              responseData.value = JSON.parse(errorText);
            } catch (e) {
              responseData.value = {
                error: true,
                status: response.status,
                statusText: response.statusText,
                text: errorText
              };
            }
            endpoint.status = 'failed';
          }
        }
      } catch (error) {
        console.error(`Error testing endpoint ${endpoint.name}:`, error);
        responseData.value = {
          error: true,
          message: error instanceof Error ? error.message : String(error)
        };
        endpoint.status = 'failed';
      } finally {
        isEndpointLoading.value = false;
      }
    };
    
    // Reset to default values
    const useDefaults = () => {
      apiUrl.value = 'https://office.86now.online/api';
      accessToken.value = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJRQmV0NjYiLCJhdWQiOiIyIiwiaXNzIjoiYWRtaW4ucWJldDY2LmNvbSIsImV4cCI6MTcxODgxOTUxOCwiaWF0IjoxNzE4NzMzMTE4LCJpcHMiOiIiLCJqdGkiOiI3NDkifQ.8_wZbYQWpihLiqOLNRIGAzgVj6ekrENr_nZ5n0Al1XdsN3TJsildqAuz5BPEmqqp_puCOElDGjdV0-Ye6widUw';
    };
    
    return {
      isLoading,
      isEndpointLoading,
      isConnected,
      connectionMessage,
      apiUrl,
      accessToken,
      testEndpoints,
      responseData,
      testConnection,
      testEndpoint,
      useDefaults,
      getHeaders
    };
  }
});
</script>

<style scoped>
pre {
  max-height: 400px;
}
</style> 