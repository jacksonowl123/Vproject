/**
 * API Tester Utility
 * 
 * This utility helps diagnose API connectivity issues by testing
 * various endpoints and connection methods.
 */

// Test URLs to try
const TEST_URLS = [
  // Direct API URLs (for servers that allow CORS)
  'http://api.dewamalaya33.com/api',
  'http://api.dewamalaya33.com',
  
  // Local proxy URLs (configured in vite.config.js)
  '/direct-api/api',
  '/api-proxy/api',
  '/direct-api',
  '/api-proxy',
  
  // Full local proxy URLs
  'http://localhost:5175/direct-api/api',
  'http://localhost:5175/api-proxy/api'
];

/**
 * Tests connectivity to an API endpoint
 * @param url The URL to test
 * @param method The HTTP method to use
 * @returns Object with success flag and status information
 */
async function testEndpoint(url: string, method: 'GET' | 'POST' = 'POST'): Promise<{ 
  success: boolean; 
  status?: number; 
  statusText?: string; 
  error?: string;
  url: string;
}> {
  try {
    console.log(`Testing endpoint: ${url} with ${method}`);
    
    // Get token from localStorage or use default bearer token
    const token = localStorage.getItem('token') || 
      'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJEZXdhTWFsYXlhMzMiLCJhdWQiOiI0IiwiaXNzIjoiZGV3YW1hbGF5YTMzLmNvbSIsImV4cCI6MTkyNDk5MTk5OSwiaWF0IjoxNzA0MDY3MjAwLCJpcHMiOiIiLCJqdGkiOiI4OSJ9.CXeMZrA6KCCNHVzp0cGAhTIbEI8Zbd3bIVtVEPktoZfPJHCYQxWBPWn3XGwmIK9jXTEzNiazFQniTRHCUYnt_A';
    
    // For POST method, include a simple test payload that should be accepted by the API
    let options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    // Add body for POST requests
    if (method === 'POST') {
      // Use the whoami endpoint as it's generally lightweight
      options.body = JSON.stringify({
        endpoint: "members.whoami",
        payload: btoa(JSON.stringify({}))
      });
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    options.signal = controller.signal;
    
    try {
      const response = await fetch(url, options).finally(() => clearTimeout(timeoutId));
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        url
      };
    } catch (error: any) {
      console.error(`Error testing ${url}:`, error.message);
      return {
        success: false,
        error: error.message,
        url
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

/**
 * Tests a POST request to an API endpoint
 * @param url The URL to test
 * @param body The request body
 * @returns Object with results of the test
 */
async function testPostRequest(url: string, body: any = {}): Promise<{
  success: boolean;
  status?: number;
  statusText?: string;
  error?: string;
  data?: any;
  url: string;
}> {
  try {
    console.log(`Testing POST to: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    let data = null;
    let error = null;
    
    try {
      data = await response.json();
    } catch (e) {
      error = 'Failed to parse response as JSON';
      try {
        // Try to get text instead
        data = await response.text();
      } catch (textError) {
        error = 'Failed to get response content';
      }
    }
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      error,
      url
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

/**
 * Tests all configured API endpoints
 * @returns Array of test results
 */
export async function testAllEndpoints(): Promise<Array<{ url: string; success: boolean; status?: number; error?: string }>> {
  const results = [];
  
  for (const url of TEST_URLS) {
    const result = await testEndpoint(url, 'POST');
    results.push(result);
    if (result.success) {
      console.log(`✅ Success! ${url} - Status: ${result.status}`);
    } else {
      console.log(`❌ Failed: ${url} - ${result.error || `Status: ${result.status}`}`);
    }
  }
  
  return results;
}

/**
 * Tests incentives API with various URLs
 * @param token Optional authentication token
 * @returns Results of the tests
 */
export async function testIncentivesApi(token?: string): Promise<any[]> {
  const results = [];
  const requestBody = {
    endpoint: "incentives.incentives",
    payload: btoa(JSON.stringify({}))
  };
  
  // Use the token if provided, or use default token
  const authToken = token || 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJEZXdhTWFsYXlhMzMiLCJhdWQiOiI0IiwiaXNzIjoiZGV3YW1hbGF5YTMzLmNvbSIsImV4cCI6MTkyNDk5MTk5OSwiaWF0IjoxNzA0MDY3MjAwLCJpcHMiOiIiLCJqdGkiOiI4OSJ9.CXeMZrA6KCCNHVzp0cGAhTIbEI8Zbd3bIVtVEPktoZfPJHCYQxWBPWn3XGwmIK9jXTEzNiazFQniTRHCUYnt_A';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
  
  for (const url of TEST_URLS) {
    try {
      console.log(`Testing incentives API at: ${url}`);
      
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        let data;
        try {
          const text = await response.text();
          try {
            // Try to parse as JSON first
            data = JSON.parse(text);
          } catch (e) {
            // If not valid JSON, just use the text
            data = text;
          }
        } catch (e) {
          data = { error: "Failed to read response body" };
        }
        
        results.push({
          url,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        if (response.ok) {
          console.log(`✅ Success! ${url} - Status: ${response.status}`);
          // Store the successful URL for future use
          localStorage.setItem('preferred_api_url', url);
        } else {
          console.log(`❌ Failed: ${url} - Status: ${response.status}`);
        }
      } catch (error: any) {
        console.error(`Error testing ${url}:`, error.message);
        results.push({
          url,
          success: false,
          error: error.message
        });
      }
    } catch (error: any) {
      results.push({
        url,
        success: false,
        error: error.message
      });
      console.log(`❌ Error: ${url} - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Runs all API tests and displays results
 */
export async function runApiDiagnostics(): Promise<void> {
  console.log('=== Starting API Diagnostics ===');
  
  // Step 1: Test basic connectivity to all endpoints
  console.log('\n--- Testing Basic Connectivity ---');
  const basicResults = await testAllEndpoints();
  
  // Step 2: Test incentives API
  console.log('\n--- Testing Incentives API ---');
  const token = localStorage.getItem('token');
  const incentiveResults = await testIncentivesApi(token);
  
  // Analyze results to find working endpoints
  const workingBasicEndpoints = basicResults.filter(r => r.success).map(r => r.url);
  const workingIncentiveEndpoints = incentiveResults.filter(r => r.success).map(r => r.url);
  
  console.log('\n=== Diagnostics Results ===');
  console.log('Working Basic Endpoints:', workingBasicEndpoints.length > 0 ? workingBasicEndpoints : 'None');
  console.log('Working Incentive Endpoints:', workingIncentiveEndpoints.length > 0 ? workingIncentiveEndpoints : 'None');
  
  // Provide recommendations
  console.log('\n=== Recommendations ===');
  if (workingIncentiveEndpoints.length > 0) {
    console.log('✅ Use one of these working endpoints for your API:');
    workingIncentiveEndpoints.forEach(url => console.log(`  - ${url}`));
  } else if (workingBasicEndpoints.length > 0) {
    console.log('⚠️ Basic connectivity works but Incentives API fails. Possible issues:');
    console.log('  - Authentication token may be invalid');
    console.log('  - Incentives endpoint may be unavailable');
    console.log('  - Request format may be incorrect');
  } else {
    console.log('❌ No working endpoints found. Possible issues:');
    console.log('  - API server may be down');
    console.log('  - CORS issues preventing connection');
    console.log('  - Network connectivity problems');
    console.log('  - Vite proxy configuration may be incorrect');
  }
  
  // Return consolidated results
  return {
    basicConnectivity: basicResults,
    incentivesApi: incentiveResults,
    workingBasicEndpoints,
    workingIncentiveEndpoints
  } as any;
}

export default {
  testEndpoint,
  testPostRequest,
  testAllEndpoints,
  testIncentivesApi,
  runApiDiagnostics
}; 