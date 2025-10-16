// Debug script to check Bearer token in browser console
// Run this in the browser developer console

console.log('=== Bearer Token Debug ===');

// Check if token exists in localStorage
const token = localStorage.getItem('token');

if (token) {
  console.log('✅ Token found in localStorage');
  console.log('📏 Token length:', token.length);
  console.log('🔤 Token starts with:', token.substring(0, 30) + '...');
  console.log('🔤 Token ends with:', '...' + token.substring(token.length - 20));
  console.log('🔑 Bearer header format:', `Bearer ${token.substring(0, 20)}...${token.substring(token.length - 10)}`);
  console.log('');
  console.log('📋 FULL TOKEN (copy this if needed):');
  console.log(token);
  console.log('');
  console.log('📋 FULL BEARER HEADER:');
  console.log(`Bearer ${token}`);
  
  // Check if token looks like a JWT
  if (token.includes('.')) {
    console.log('');
    console.log('🔍 JWT Analysis:');
    const parts = token.split('.');
    console.log('- Header + Payload + Signature parts:', parts.length);
    
    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(parts[1]));
      console.log('- JWT Payload:', payload);
      
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        console.log('- Token expires:', expDate.toLocaleString());
        console.log('- Token valid:', expDate > new Date() ? '✅ YES' : '❌ EXPIRED');
      }
    } catch (e) {
      console.log('- Could not decode JWT payload');
    }
  }
} else {
  console.log('❌ No token found in localStorage');
  console.log('💡 You may need to sign in first');
}

console.log('');
console.log('🛠️ To manually set a token:');
console.log('localStorage.setItem("token", "your_token_here")');

console.log('');
console.log('🗑️ To clear the token:');
console.log('localStorage.removeItem("token")'); 