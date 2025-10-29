import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import cp from 'vite-plugin-cp';

// Define custom error type to include code property
interface ProxyError extends Error {
  code?: string;
}

export default defineConfig({
  plugins: [
    vue(),
    cp(
    {
      targets:
      [
        {
          src: 'laravel-api/public/index.html',
          dest: 'laravel-api/resources/views',
          rename: 'index.blade.php'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    extensions: ['.js', '.ts', '.vue']
  },
  build:
  {
    emptyOutDir: false,
    outDir: 'laravel-api/public'
  },
  server: {
    proxy: {
      // Payment gateway proxy
      '/pg-proxy': {
        target: 'http://pg.dewamalaya33.com',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        proxyTimeout: 90000,
        rewrite: (path) => path.replace(/^\/pg-proxy/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err: ProxyError, req, res) => {
            console.log('Payment gateway proxy error', err);
            // Handle payment gateway errors nicely
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json'
              });
              const json = { 
                error: 'Payment gateway connection failed', 
                message: err.message || 'Unknown error',
                code: err.code
              };
              res.end(JSON.stringify(json));
            }
          });
          
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            console.log('Payment Gateway Request:', req.method, req.url);
            
            proxyReq.setTimeout(90000);
            
            // Add proper CORS headers for preflight requests
            if (req.method === 'OPTIONS') {
              proxyReq.setHeader('Access-Control-Allow-Origin', '*');
              proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
              proxyReq.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
              proxyReq.setHeader('Access-Control-Max-Age', '86400');
            }
          });
          
          // Intercept and modify response
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Payment Gateway Response:', proxyRes.statusCode, req.url);
            
            // Add CORS headers to all responses
            proxyRes.headers['access-control-allow-origin'] = '*';
            
            // Important: Fix for JSON parsing error by handling raw responses
            // and ensuring we return proper JSON content
            const chunks: Buffer[] = [];
            
            // Collect data chunks from response
            proxyRes.on('data', (chunk) => {
              chunks.push(Buffer.from(chunk));
            });
            
            // Process response when complete
            proxyRes.on('end', () => {
              const bodyBuffer = Buffer.concat(chunks);
              const bodyString = bodyBuffer.toString('utf8');
              
              if (proxyRes.statusCode === 200) {
                // Check if the response is valid JSON
                try {
                  // Try to parse as JSON to validate
                  const jsonData = JSON.parse(bodyString);
                  console.log('Valid JSON response from payment gateway:', jsonData);
                  
                  // Pass through the original response
                  if (!res.headersSent) {
                    res.writeHead(200, {
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': '*'
                    });
                    res.end(bodyString);
                  }
                } catch (e) {
                  console.error('Invalid JSON response from payment gateway:', bodyString.substring(0, 100));
                  
                  // If we received HTML or invalid JSON, convert to valid JSON error response
                  if (!res.headersSent) {
                    res.writeHead(500, {
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': '*'
                    });
                    const errorJson = { 
                      error: 'Invalid response format from payment gateway',
                      message: 'Received non-JSON response from server'
                    };
                    res.end(JSON.stringify(errorJson));
                  }
                }
              } else if (proxyRes.statusCode === 404) {
                console.log('Detected 404 for payment gateway, returning proper error response');
                
                if (!res.headersSent) {
                  res.writeHead(404, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  });
                  const errorJson = { 
                    error: 'Payment gateway endpoint not found',
                    message: 'The requested payment gateway resource was not found'
                  };
                  res.end(JSON.stringify(errorJson));
                }
              } else {
                // For other status codes, return a properly formatted error
                console.log(`Payment gateway returned status ${proxyRes.statusCode}`);
                
                if (!res.headersSent) {
                  res.writeHead(proxyRes.statusCode, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  });
                  
                  // Try to see if the error response is already valid JSON
                  try {
                    const jsonError = JSON.parse(bodyString);
                    res.end(JSON.stringify(jsonError));
                  } catch {
                    // If not valid JSON, create a proper JSON error
                    const errorJson = { 
                      error: `Payment gateway returned ${proxyRes.statusCode}`,
                      message: bodyString.substring(0, 200) // Include part of the response for debugging
                    };
                    res.end(JSON.stringify(errorJson));
                  }
                }
              }
            });
          });
        }
      },
      // Add a new route specifically for the payment gateway pg endpoint
      '/pg-api': {
        target: 'http://pg.dewamalaya33.com',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
        rewrite: (path) => path.replace(/^\/pg-api/, ''),
        configure: (proxy, _options) => {
          // Same error handling as /pg-proxy
          proxy.on('error', (err: ProxyError, req, res) => {
            console.log('PG API proxy error', err);
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json'
              });
              const json = { 
                error: 'Payment gateway API connection failed', 
                message: err.message || 'Unknown error',
                code: err.code
              };
              res.end(JSON.stringify(json));
            }
          });
          
          // Same request handling as /pg-proxy
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            console.log('PG API Request:', req.method, req.url);
            
            // Handle CORS preflight requests
            if (req.method === 'OPTIONS') {
              proxyReq.setHeader('Access-Control-Allow-Origin', '*');
              proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
              proxyReq.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
              proxyReq.setHeader('Access-Control-Max-Age', '86400');
            }
          });
          
          // Same response handling as /pg-proxy to ensure we always return valid JSON
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('PG API Response:', proxyRes.statusCode, req.url);
            
            // Add CORS headers to all responses
            proxyRes.headers['access-control-allow-origin'] = '*';
            
            // Intercept and process the response data
            const chunks: Buffer[] = [];
            
            proxyRes.on('data', (chunk) => {
              chunks.push(Buffer.from(chunk));
            });
            
            proxyRes.on('end', () => {
              const bodyBuffer = Buffer.concat(chunks);
              const bodyString = bodyBuffer.toString('utf8');
              
              // Always ensure we return valid JSON
              try {
                const jsonData = JSON.parse(bodyString);
                if (!res.headersSent) {
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  });
                  res.end(JSON.stringify(jsonData));
                }
              } catch (e) {
                console.error('Invalid JSON from PG API:', bodyString.substring(0, 100));
                if (!res.headersSent) {
                  res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  });
                  const errorJson = { 
                    error: 'Invalid response from PG API',
                    message: 'Received non-JSON response'
                  };
                  res.end(JSON.stringify(errorJson));
                }
              }
            });
          });
        }
      }
    },
    cors: {
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  }
});
