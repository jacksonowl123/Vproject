<template>
  <div class="bg-gray-100 rounded-lg shadow p-4 mt-4 text-sm">
    <h3 class="font-bold mb-2 flex items-center">
      <i class="fas fa-wrench mr-2 text-blue-500"></i>
      Deposit Connection Diagnostics
      <button @click="toggleVisibility" class="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none">
        <i :class="isVisible ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
      </button>
    </h3>
    
    <div v-if="isVisible" class="mt-2">
      <div v-if="loading" class="flex justify-center py-4">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else>
        <div class="mb-3">
          <div class="font-medium">Payment Gateway Connection:</div>
          <div class="flex items-center mt-1">
            <div 
              :class="[
                'w-3 h-3 rounded-full mr-2', 
                gatewayStatus === 'ok' ? 'bg-green-500' : 
                gatewayStatus === 'warning' ? 'bg-yellow-500' : 
                'bg-red-500'
              ]"
            ></div>
            <span>{{ gatewayStatusMessage }}</span>
          </div>
        </div>
        
        <div class="mb-3">
          <div class="font-medium">API Connection:</div>
          <div class="flex items-center mt-1">
            <div 
              :class="[
                'w-3 h-3 rounded-full mr-2', 
                apiStatus === 'ok' ? 'bg-green-500' : 
                apiStatus === 'warning' ? 'bg-yellow-500' : 
                'bg-red-500'
              ]"
            ></div>
            <span>{{ apiStatusMessage }}</span>
          </div>
        </div>
        
        <div v-if="showRecommendations" class="mt-4 border-t pt-3">
          <div class="font-medium mb-2">Recommendations:</div>
          <ul class="list-disc pl-5 space-y-1 text-sm">
            <li v-for="(rec, index) in recommendations" :key="index">
              {{ rec }}
            </li>
          </ul>
        </div>
        
        <div class="mt-4 flex justify-between">
          <button 
            @click="runDiagnostics" 
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none text-xs"
            :disabled="loading"
          >
            Run Diagnostics
          </button>
          
          <button 
            v-if="hasIssues"
            @click="applyFixes" 
            class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none text-xs"
            :disabled="loading"
          >
            Apply Quick Fixes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'DepositDiagnostics',
  
  setup() {
    const isVisible = ref(false);
    const loading = ref(false);
    const gatewayStatus = ref<'ok' | 'warning' | 'error'>('warning');
    const apiStatus = ref<'ok' | 'warning' | 'error'>('warning');
    const gatewayStatusMessage = ref('Not tested yet');
    const apiStatusMessage = ref('Not tested yet');
    const recommendations = ref<string[]>([]);
    
    const hasIssues = computed(() => {
      return gatewayStatus.value !== 'ok' || apiStatus.value !== 'ok';
    });
    
    const showRecommendations = computed(() => {
      return recommendations.value.length > 0;
    });
    
    const toggleVisibility = () => {
      isVisible.value = !isVisible.value;
      if (isVisible.value && gatewayStatus.value === 'warning' && apiStatus.value === 'warning') {
        runDiagnostics();
      }
    };
    
    const runDiagnostics = async () => {
      loading.value = true;
      recommendations.value = [];
      
      try {
        // Test API connectivity first with longer timeout
        await testApiConnection();
        
        // Test payment gateway connectivity second
        await testGatewayConnection();
        
        // Generate recommendations based on test results
        generateRecommendations();
      } catch (error) {
        console.error('Diagnostics error:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const testApiConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Try multiple API URLs in sequence
        const apiUrls = [
          import.meta.env.DEV ? '/api-proxy/api' : 'http://api.dewamalaya33.com/api',
          import.meta.env.DEV ? '/direct-api/api' : 'http://api.dewamalaya33.com/api',
          import.meta.env.DEV ? '/api-proxy' : 'http://api.dewamalaya33.com',
          import.meta.env.DEV ? '/direct-api' : 'http://api.dewamalaya33.com'
        ];
        
        // Get token from localStorage or use the default bearer token
        const token = localStorage.getItem('token') || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJEZXdhTWFsYXlhMzMiLCJhdWQiOiI0IiwiaXNzIjoiZGV3YW1hbGF5YTMzLmNvbSIsImV4cCI6MTkyNDk5MTk5OSwiaWF0IjoxNzA0MDY3MjAwLCJpcHMiOiIiLCJqdGkiOiI4OSJ9.CXeMZrA6KCCNHVzp0cGAhTIbEI8Zbd3bIVtVEPktoZfPJHCYQxWBPWn3XGwmIK9jXTEzNiazFQniTRHCUYnt_A';
        
        // Create simple test payload (using the whoami endpoint which is lightweight)
        const testPayload = {
          endpoint: "members.whoami",
          payload: btoa(JSON.stringify({}))
        };
        
        let success = false;
        let lastError = null;
        
        // Try each API URL until one works
        for (const apiUrl of apiUrls) {
          try {
            console.log(`Testing API URL: ${apiUrl}`);
            
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              },
              body: JSON.stringify(testPayload),
              signal: controller.signal
            });
            
            if (response.ok) {
              apiStatus.value = 'ok';
              apiStatusMessage.value = `Connected successfully to ${apiUrl}`;
              success = true;
              
              // Store the working URL in localStorage for future use
              localStorage.setItem('preferred_api_url', apiUrl);
              break;
            } else {
              lastError = `Response status: ${response.status} from ${apiUrl}`;
              
              try {
                const errorData = await response.text();
                console.log('API Response error data:', errorData);
              } catch (e) {
                // Ignore error reading response body
              }
            }
          } catch (error) {
            console.error('API test error for URL', apiUrl, ':', error);
            lastError = error.message || 'Connection failed';
          }
        }
        
        if (!success) {
          apiStatus.value = 'error';
          apiStatusMessage.value = lastError || 'All API endpoints failed';
        }
        
        clearTimeout(timeoutId);
      } catch (error) {
        const err = error as { name?: string, message?: string };
        console.error('API test error:', err);
        
        apiStatus.value = 'error';
        
        if (err.name === 'AbortError') {
          apiStatusMessage.value = 'Connection timeout (15s)';
        } else if (err.message?.includes('522')) {
          apiStatusMessage.value = 'Cloudflare error 522 (Connection timed out)';
        } else if (err.message?.includes('CORS')) {
          apiStatusMessage.value = 'CORS error - try using a different API endpoint';
        } else {
          apiStatusMessage.value = err.message || 'Connection failed';
        }
      }
    };
    
    const testGatewayConnection = async () => {
      const gatewayUrls = [
        // Try with exact URL from documentation
        'http://pg.dewamalaya33.com/pg',
        // Try with possible alternatives
        import.meta.env.DEV ? '/pg-proxy/pg' : 'http://pg.dewamalaya33.com/pg',
        'http://pg.dewamalaya33.com',
        'https://pg.dewamalaya33.com/pg'
      ];
      
      let success = false;
      let lastError = null;
      let lastStatus = null;
      
      // Try each gateway endpoint
      for (const gatewayUrl of gatewayUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          // Get token from localStorage or use default bearer token
          const token = localStorage.getItem('token') || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJEZXdhTWFsYXlhMzMiLCJhdWQiOiI0IiwiaXNzIjoiZGV3YW1hbGF5YTMzLmNvbSIsImV4cCI6MTkyNDk5MTk5OSwiaWF0IjoxNzA0MDY3MjAwLCJpcHMiOiIiLCJqdGkiOiI4OSJ9.CXeMZrA6KCCNHVzp0cGAhTIbEI8Zbd3bIVtVEPktoZfPJHCYQxWBPWn3XGwmIK9jXTEzNiazFQniTRHCUYnt_A';
          
          // Create a minimal test payload
          // Using a tiny amount (0.01) that won't actually process to just test connectivity
          const testPayload = {
            endpoint: "transactions.deposit",
            payload: btoa(JSON.stringify({ 
              bankid: 221, 
              amount: 0.01,
              incentiveid: 0,
              remarks: "connectivity test" 
            }))
          };
          
          console.log('Testing gateway with URL:', gatewayUrl);
          const response = await fetch(gatewayUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify(testPayload),
            signal: controller.signal
          }).finally(() => clearTimeout(timeoutId));
          
          console.log('Gateway response status:', response.status);
          lastStatus = response.status;
          
          if (response.ok) {
            success = true;
            gatewayStatus.value = 'ok';
            gatewayStatusMessage.value = `Connected successfully to ${gatewayUrl}`;
            
            try {
              // Try to read response data to verify it's working as expected
              const responseData = await response.json();
              console.log('Gateway test response:', responseData);
              
              if (responseData.url) {
                // If we got a valid URL back, the connection is definitely working
                gatewayStatus.value = 'ok';
                gatewayStatusMessage.value = 'Gateway confirmed working';
                
                // Store this working URL for future use
                localStorage.setItem('preferred_gateway_url', gatewayUrl);
                break; // No need to try other URLs
              }
            } catch (e) {
              console.error('Failed to parse gateway response', e);
            }
          } else {
            // Save error but continue trying other URLs
            const text = await response.text();
            console.error(`Gateway failed for ${gatewayUrl}:`, text);
            lastError = `Status ${response.status} from ${gatewayUrl}`;
          }
        } catch (error: unknown) {
          const err = error as { name?: string, message?: string };
          console.error('Gateway test error:', err);
          lastError = err.message || 'Connection failed';
          
          if (err.name === 'AbortError') {
            lastError = 'Connection timeout (10s)';
          }
        }
      }
      
      // If no URL worked, set error status
      if (!success) {
        gatewayStatus.value = 'error';
        if (lastStatus === 404) {
          gatewayStatusMessage.value = 'Payment gateway URLs not found (404). Server may be down or path incorrect.';
        } else {
          gatewayStatusMessage.value = lastError || 'Connection failed';
        }
      }
    };
    
    const generateRecommendations = () => {
      const recs: string[] = [];
      
      // API-specific recommendations
      if (apiStatus.value === 'error') {
        recs.push('Try refreshing the page and attempting the deposit again');
        recs.push('Check your internet connection and try using a different network');
        
        if (apiStatusMessage.value.includes('timeout') || apiStatusMessage.value.includes('522')) {
          recs.push('Wait a few minutes and try again - the server might be temporarily overloaded');
        }
        
        if (apiStatusMessage.value.includes('CORS')) {
          recs.push('Try using a different browser');
        }
      }
      
      // Gateway-specific recommendations
      if (gatewayStatus.value === 'error') {
        if (gatewayStatusMessage.value.includes('timeout') || gatewayStatusMessage.value.includes('522')) {
          recs.push('Payment gateway may be under maintenance - try again later');
        }
      }
      
      // General recommendations if both have issues
      if (apiStatus.value !== 'ok' && gatewayStatus.value !== 'ok') {
        recs.push('Contact customer support if the issue persists');
      }
      
      recommendations.value = recs;
    };
    
    const applyFixes = async () => {
      loading.value = true;
      
      try {
        localStorage.removeItem('preferred_api_proxy');
        localStorage.removeItem('preferred_gateway_url');
        
        // Clear the browser cache for API and gateway URLs
        const cacheNames = await window.caches?.keys();
        if (cacheNames) {
          await Promise.all(
            cacheNames.map(cacheName => {
              return window.caches.delete(cacheName);
            })
          );
        }
        
        // Reload browser data
        window.location.reload();
      } catch (error) {
        console.error('Apply fixes error:', error);
        loading.value = false;
      }
    };
    
    return {
      isVisible,
      loading,
      gatewayStatus,
      apiStatus,
      gatewayStatusMessage,
      apiStatusMessage,
      recommendations,
      hasIssues,
      showRecommendations,
      toggleVisibility,
      runDiagnostics,
      applyFixes
    };
  }
});
</script> 