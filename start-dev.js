/**
 * Script to start the development server with optimized settings
 * to help avoid Cloudflare 522 errors when connecting to the API
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting development server with optimized API connection settings...');

// Set environment variables to optimize connections
process.env.NODE_OPTIONS = '--max-http-header-size=16384';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Only for development!

// Ensure vite.config.ts has the correct API URL
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Check if the API URL is correctly set
if (!viteConfig.includes("target: 'http://api.dewamalaya33.com'")) {
  console.log('API URL in vite.config.ts is incorrect. Setting to http://api.dewamalaya33.com...');
  
  // Update the config
  viteConfig = viteConfig.replace(
    /target: '(.+?)'/g, 
    "target: 'http://api.dewamalaya33.com'"
  );
  
  // Save the updated config
  fs.writeFileSync(viteConfigPath, viteConfig);
  console.log('Updated vite.config.ts with correct API URL.');
}

// Start the development server
console.log('Starting development server...');
const viteProcess = spawn('npm', ['run', 'dev'], { 
  shell: true, 
  stdio: 'inherit',
  env: { ...process.env }
});

viteProcess.on('error', (error) => {
  console.error('Failed to start development server:', error);
});

viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Development server exited with code ${code}`);
  }
});

console.log('\n');
console.log('=============================================================');
console.log('| Development server is starting with optimized API settings |');
console.log('=============================================================');
console.log('\n');
console.log('If you encounter 522 errors, try the following:');
console.log('1. Refresh the page');
console.log('2. Check your internet connection');
console.log('3. Visit http://localhost:5173/api-test to test API connectivity');
console.log('\n'); 