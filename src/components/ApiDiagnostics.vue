<template>
  <div class="api-diagnostics bg-white p-4 rounded shadow">
    <h2 class="text-xl font-bold mb-4">API Diagnostics</h2>
    
    <div v-if="isLoading" class="text-center py-6">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p>Running diagnostics, please wait...</p>
    </div>
    
    <div v-else>
      <div v-if="diagnosticsRun" class="mb-6">
        <div class="flex items-center mb-2">
          <h3 class="text-lg font-medium">Results</h3>
          <button @click="runDiagnostics" class="ml-auto text-blue-500 hover:text-blue-600">
            <i class="fas fa-sync-alt"></i> Run Again
          </button>
        </div>
        
        <div class="bg-gray-100 p-3 rounded mb-4">
          <div class="mb-2">
            <div class="font-medium">Basic Connectivity</div>
            <div v-if="workingBasicEndpoints.length > 0" class="text-green-600">
              ✅ Found {{ workingBasicEndpoints.length }} working endpoint(s)
            </div>
            <div v-else class="text-red-600">
              ❌ No working endpoints found
            </div>
          </div>
          
          <div class="mb-2">
            <div class="font-medium">Incentives API</div>
            <div v-if="workingIncentiveEndpoints.length > 0" class="text-green-600">
              ✅ Found {{ workingIncentiveEndpoints.length }} working endpoint(s)
            </div>
            <div v-else class="text-red-600">
              ❌ No working Incentives API endpoints found
            </div>
          </div>
        </div>
        
        <div class="mb-4">
          <h3 class="font-medium mb-2">Recommendations</h3>
          <div v-if="workingIncentiveEndpoints.length > 0" class="text-green-700 bg-green-50 p-3 rounded">
            <div class="font-medium mb-1">✅ Use one of these working endpoints:</div>
            <div v-for="url in workingIncentiveEndpoints" :key="url" class="ml-2 mb-1">
              • {{ url }}
            </div>
            <button 
              @click="applyRecommendedEndpoint(workingIncentiveEndpoints[0])" 
              class="mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              Apply Best Endpoint
            </button>
          </div>
          
          <div v-else-if="workingBasicEndpoints.length > 0" class="text-yellow-700 bg-yellow-50 p-3 rounded">
            <div class="font-medium mb-1">⚠️ Basic connectivity works but API fails:</div>
            <ul class="list-disc ml-6">
              <li>Authentication token may be invalid</li>
              <li>Incentives endpoint may be unavailable</li>
              <li>Request format may be incorrect</li>
              <li>The server may be returning 500 errors</li>
            </ul>
            <div class="mt-2">
              <button 
                @click="clearToken" 
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded mr-2"
              >
                Clear Token &amp; Retry
              </button>
              <button 
                @click="useMockData" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
              >
                Use Mock Data
              </button>
            </div>
          </div>
          
          <div v-else class="text-red-700 bg-red-50 p-3 rounded">
            <div class="font-medium mb-1">❌ No working endpoints found:</div>
            <ul class="list-disc ml-6">
              <li>API server may be down</li>
              <li>CORS issues preventing connection</li>
              <li>Network connectivity problems</li>
              <li>Vite proxy configuration may be incorrect</li>
            </ul>
            <div class="mt-2 flex flex-wrap gap-2">
              <button 
                @click="useMockData" 
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Use Mock Data
              </button>
              <button 
                @click="tryAlternativeURL('/api-proxy/api')" 
                class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded"
              >
                Try /api-proxy/api
              </button>
              <button 
                @click="tryAlternativeURL('/direct-api/api')" 
                class="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded"
              >
                Try /direct-api/api
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <details>
            <summary class="cursor-pointer text-gray-600 hover:text-gray-800">Technical Details</summary>
            <div class="mt-2 bg-gray-50 p-3 rounded text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
              {{ JSON.stringify(results, null, 2) }}
            </div>
          </details>
        </div>
      </div>
      
      <div v-else>
        <p class="mb-4">Run diagnostics to check the API connection status and fix any issues.</p>
        <button 
          @click="runDiagnostics" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start Diagnostics
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { runApiDiagnostics } from '../utils/apiTester';
import { laravelApi as api } from '../services/laravelApi';

export default defineComponent({
  name: 'ApiDiagnostics',
  setup() {
    const isLoading = ref(false);
    const diagnosticsRun = ref(false);
    const results = ref({});
    const workingBasicEndpoints = ref<string[]>([]);
    const workingIncentiveEndpoints = ref<string[]>([]);
    
    const runDiagnostics = async () => {
      isLoading.value = true;
      try {
        const diagnosticResults = await runApiDiagnostics();
        results.value = diagnosticResults;
        
        // Extract working endpoints
        workingBasicEndpoints.value = diagnosticResults.workingBasicEndpoints || [];
        workingIncentiveEndpoints.value = diagnosticResults.workingIncentiveEndpoints || [];
        
        diagnosticsRun.value = true;
      } catch (error) {
        console.error('Diagnostics error:', error);
        alert('An error occurred during diagnostics');
      } finally {
        isLoading.value = false;
      }
    };
    
    /**
     * Applies the recommended endpoint by setting it as the current proxy
     */
    const applyRecommendedEndpoint = (url: string) => {
      // Find the index of the URL in the CORS_PROXIES array
      // This relies on implementation details of the api.ts file
      const allProxies = [
        '/direct-api/api',
        '/api-proxy/api',
        '/direct-api/api/',
        '/api-proxy/api/',
        '/direct-api',
        '/api-proxy',
        'http://localhost:5175/direct-api/api',
        'http://localhost:5175/api-proxy/api'
      ];
      
      const index = allProxies.indexOf(url);
      if (index !== -1) {
        // We assume the API service has a currentProxyIndex variable
        // that determines which proxy to use
        window.localStorage.setItem('preferred_api_proxy', url);
        alert(`Applied endpoint: ${url}\nPlease refresh the page to apply the change.`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        alert(`Could not apply endpoint: ${url}`);
      }
    };
    
    /**
     * Clears the authentication token and retries
     */
    const clearToken = () => {
      localStorage.removeItem('token');
      alert('Authentication token cleared. Retrying diagnostics...');
      runDiagnostics();
    };
    
    /**
     * Enables mock data mode
     */
    const useMockData = () => {
      if (api && typeof api.enableMockApi === 'function') {
        api.enableMockApi(true);
        alert('Mock API data enabled. The application will now use mock data instead of real API calls.');
      } else {
        alert('Could not enable mock API data mode.');
      }
    };
    
    /**
     * Tries an alternative URL for the API
     */
    const tryAlternativeURL = (url: string) => {
      // Store preferred API URL in localStorage
      localStorage.setItem('preferred_api_proxy', url);
      // Set mock mode just in case the API still fails
      api.enableMockApi(true);
      
      alert(`Set API URL to: ${url}\nMock data enabled as fallback.\nPlease refresh the page to apply changes.`);
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    };
    
    return {
      isLoading,
      diagnosticsRun,
      results,
      workingBasicEndpoints,
      workingIncentiveEndpoints,
      runDiagnostics,
      applyRecommendedEndpoint,
      clearToken,
      useMockData,
      tryAlternativeURL
    };
  }
});
</script> 