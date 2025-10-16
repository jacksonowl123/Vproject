const axios = require('axios');

const LARAVEL_API_BASE = 'http://localhost:8000/api';

async function testLaravelAPI() {
  console.log('🧪 Testing Laravel API Backend...\n');

  try {
    // Test connection endpoint
    console.log('1. Testing connection endpoint...');
    const connectionTest = await axios.get(`${LARAVEL_API_BASE}/proxy/test`);
    console.log('✅ Connection test result:', connectionTest.data);
  } catch (error) {
    console.log('❌ Connection test failed:', error.response?.data || error.message);
  }

  try {
    // Test signin endpoint
    console.log('\n2. Testing signin endpoint...');
    const signinTest = await axios.post(`${LARAVEL_API_BASE}/proxy/signin`, {
      username: 'testuser',
      password: 'testpass'
    });
    console.log('✅ Signin test result:', signinTest.data);
  } catch (error) {
    console.log('❌ Signin test failed:', error.response?.data || error.message);
  }

  try {
    // Test manual deposit endpoint
    console.log('\n3. Testing manual deposit endpoint...');
    const depositTest = await axios.post(`${LARAVEL_API_BASE}/proxy/deposit-manual`, {
      amount: 100,
      incentiveid: 1,
      remarks: 'Test deposit'
    }, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    console.log('✅ Manual deposit test result:', depositTest.data);
  } catch (error) {
    console.log('❌ Manual deposit test failed:', error.response?.data || error.message);
  }

  try {
    // Test incentives endpoint
    console.log('\n4. Testing incentives endpoint...');
    const incentivesTest = await axios.get(`${LARAVEL_API_BASE}/proxy/incentives`);
    console.log('✅ Incentives test result:', incentivesTest.data);
  } catch (error) {
    console.log('❌ Incentives test failed:', error.response?.data || error.message);
  }

  console.log('\n🏁 Laravel API testing completed!');
}

// Run the test
testLaravelAPI().catch(console.error); 