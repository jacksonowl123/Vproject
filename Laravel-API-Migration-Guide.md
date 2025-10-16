# Laravel API Backend Migration Guide

## Overview

This project has been enhanced with a Laravel backend that serves as a proxy for all external API calls, eliminating CORS issues and providing better security, logging, and error handling.

## Architecture

```
Vue.js Frontend (localhost:5173) 
    ↓ 
Laravel Backend (localhost:8000) 
    ↓ 
External API (api.dewamalaya33.com)
```

## Benefits of Using Laravel Backend

### ✅ **CORS Issues Resolved**
- No more browser CORS restrictions
- Server-to-server communication bypasses browser security policies

### 🛡️ **Enhanced Security**
- API keys and secrets remain on the server
- Centralized authentication handling
- Request/response logging for debugging

### 📊 **Better Monitoring**
- All API requests logged in Laravel logs
- Error tracking and analytics
- Performance monitoring capabilities

### 🔧 **Improved Error Handling**
- Standardized error responses
- Better error messages for users
- Retry logic and fallback mechanisms

## Quick Start

### 1. Start the Laravel Backend

```bash
cd laravel-api
php artisan serve --port=8000
```

The Laravel backend will be available at `http://localhost:8000`

### 2. Update Frontend Configuration

The Vue.js frontend now includes both direct API calls and Laravel backend options. You can switch between them using the API mode toggle in the ManualDeposit component.

### 3. Environment Configuration

The Laravel backend uses environment variables for configuration:

```env
# External API Configuration
EXTERNAL_API_BASE_URL=http://api.dewamalaya33.com/api
EXTERNAL_API_BEARER_TOKEN=your_bearer_token_here
```

## API Endpoints

### Laravel Backend Routes

All routes are prefixed with `/api/proxy/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/proxy/signin` | Member authentication |
| POST | `/proxy/create-member` | Create new member |
| GET | `/proxy/member-details` | Get member details |
| PUT | `/proxy/update-profile` | Update member profile |
| POST | `/proxy/deposit-manual` | Manual deposit |
| POST | `/proxy/deposit-gateway` | Gateway deposit |
| POST | `/proxy/withdraw` | Withdrawal |
| GET | `/proxy/transactions` | Get transactions |
| GET | `/proxy/platform-balance` | Get platform balance |
| POST | `/proxy/transfer-to` | Transfer to platform |
| POST | `/proxy/transfer-from` | Transfer from platform |
| GET | `/proxy/system-banks` | Get system bank accounts |
| POST | `/proxy/create-bank` | Create bank account |
| GET | `/proxy/incentives` | Get incentives |
| POST | `/proxy/launch-game` | Launch game |
| GET | `/proxy/test` | Test connection |

## Frontend Usage

### Using Laravel Backend API

```typescript
import { laravelApi } from '@/services/laravelApi';

// Manual deposit through Laravel backend
const response = await laravelApi.depositManual({
  amount: 100,
  incentiveid: 1,
  remarks: 'Bank transfer reference'
});
```

### Switching Between APIs

The `ManualDeposit.vue` component includes a toggle to switch between:
- **Laravel Backend** (Recommended): No CORS issues, better security
- **Direct API**: Original implementation with CORS challenges

## Authentication

### Frontend Token Management

```typescript
// Store authentication token
laravelApi.setAuthToken(token);

// Clear authentication token
laravelApi.clearAuthToken();
```

### Backend Token Handling

The Laravel backend accepts tokens via:
- `Authorization: Bearer <token>` header
- `X-Auth-Token` header

## Error Handling

### Standardized Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error_type": "server_error"
}
```

### Server Error Detection

The Laravel backend specifically handles 500 server errors from the external API:

```json
{
  "success": false,
  "message": "Transaction system error detected. The server is experiencing issues with deposit operations.",
  "error_type": "server_error"
}
```

## Logging and Debugging

### Laravel Logs

All API requests and responses are logged in Laravel:

```bash
tail -f laravel-api/storage/logs/laravel.log
```

### Frontend Debugging

Enable console logging in the browser to see detailed request/response information.

## Migration Steps

### 1. Update Existing Components

Replace direct API calls with Laravel backend calls:

```typescript
// Before (Direct API)
import { api } from '@/services/api';
const response = await api.depositManual(data);

// After (Laravel Backend)
import { laravelApi } from '@/services/laravelApi';
const response = await laravelApi.depositManual(data);
```

### 2. Update Error Handling

Handle the new standardized error format:

```typescript
try {
  const response = await laravelApi.depositManual(data);
  // Handle success
} catch (error) {
  if (error.response?.data?.error_type === 'server_error') {
    // Handle server-side errors
  } else {
    // Handle other errors
  }
}
```

### 3. Test Both Modes

Use the API mode toggle in components to test both direct API and Laravel backend modes during development.

## Production Considerations

### 1. HTTPS Configuration

Ensure both frontend and Laravel backend use HTTPS in production:

```env
APP_URL=https://your-laravel-backend.com
```

### 2. CORS Configuration

Update CORS settings for production domains:

```php
// config/cors.php
'allowed_origins' => [
    'https://your-frontend-domain.com',
],
```

### 3. Rate Limiting

Implement rate limiting for API endpoints:

```php
// In routes/api.php
Route::middleware(['throttle:60,1'])->group(function () {
    // API routes
});
```

### 4. Caching

Implement caching for frequently accessed data:

```php
// In controller
$incentives = Cache::remember('incentives', 3600, function () {
    return $this->makeApiCall('GET', 'incentive.list');
});
```

## Troubleshooting

### Laravel Backend Not Starting

```bash
# Check PHP version
php --version

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Check for errors
php artisan serve --port=8000
```

### CORS Issues

Verify CORS configuration in `config/cors.php` and ensure your frontend domain is allowed.

### External API Connection Issues

Check Laravel logs for detailed error messages:

```bash
tail -f storage/logs/laravel.log
```

### Authentication Problems

Ensure tokens are properly passed in request headers and verify token format in Laravel logs.

## Future Enhancements

1. **Database Integration**: Store transaction logs locally
2. **Caching Layer**: Implement Redis/Memcached for performance
3. **Rate Limiting**: Protect against abuse
4. **API Versioning**: Support multiple API versions
5. **WebSocket Support**: Real-time updates
6. **Queue System**: Handle heavy operations asynchronously

## Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Enable Vue.js debug mode
3. Use the API mode toggle to test both implementations
4. Contact development team with specific error messages 