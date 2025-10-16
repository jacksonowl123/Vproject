<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExternalApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Preflight handler for all API routes (CORS)
Route::options('/{any}', function (Request $request) {
    $origin = $request->headers->get('Origin', '*');
    return response('', 204)->withHeaders([
        'Access-Control-Allow-Origin' => $origin,
        'Vary' => 'Origin',
        'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers' => $request->headers->get('Access-Control-Request-Headers', 'Authorization, Content-Type, X-Requested-With, Accept, Origin'),
        'Access-Control-Max-Age' => '86400',
    ]);
})->where('any', '.*');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Simple test route
Route::get('/test', function () {
    return response()->json(['message' => 'API routes are working!', 'timestamp' => now()]);
});

// External API Info
Route::get('/proxy/external-api-info', function () {
    return response()->json([
        'external_api_url' => env('EXTERNAL_API_BASE_URL', 'http://api.dewamalaya33.com/api'),
        'bearer_token_set' => !empty(env('EXTERNAL_API_BEARER_TOKEN')),
        'status' => 'Laravel API proxy is running'
    ]);
});

// External API Proxy Routes
Route::group(['prefix' => 'v1'], function () {
    
    // Connection testing
    Route::get('/test-connection', [ExternalApiController::class, 'testConnection']);
    
    // Authentication routes (no auth required)
    Route::post('/auth/signin', [ExternalApiController::class, 'signIn']);
    Route::post('/members/create', [ExternalApiController::class, 'createMember']);
    
    // Protected routes (require authentication token)
    Route::group(['middleware' => 'api'], function () {
        
        // Member management
        Route::get('/members/details', [ExternalApiController::class, 'getMemberDetails']);
        Route::put('/members/profile', [ExternalApiController::class, 'updateMemberProfile']);
        
        // Deposit operations
        Route::post('/deposits/manual', [ExternalApiController::class, 'depositManual']);
        Route::post('/deposits/gateway', [ExternalApiController::class, 'depositGateway']);
        
        // Withdrawal operations
        Route::post('/withdrawals', [ExternalApiController::class, 'withdraw']);
        
        // Transaction history
        Route::get('/transactions', [ExternalApiController::class, 'getTransactions']);
        
        // Wallet operations
        Route::post('/wallets/balance', [ExternalApiController::class, 'getPlatformBalance']);
        Route::get('/wallets/balances', [ExternalApiController::class, 'getAllPlatformsBalance']);
        Route::post('/wallets/transfer-to', [ExternalApiController::class, 'transferTo']);
        Route::post('/wallets/transfer-from', [ExternalApiController::class, 'transferFrom']);
        
        // Bank account management
        Route::get('/banks/system', [ExternalApiController::class, 'getSystemBankAccounts']);
        Route::post('/banks/create', [ExternalApiController::class, 'createBankAccount']);
        
        // Incentives
        Route::get('/incentives', [ExternalApiController::class, 'getIncentives']);
        
        // Game operations
        Route::post('/games/launch', [ExternalApiController::class, 'launchGame']);
        
        // CMS content
        Route::get('/cms/content', [ExternalApiController::class, 'getCmsContent']);
    });
});

// Alternative route structure for easier migration
Route::group(['prefix' => 'proxy'], function () {
    
    // Authentication
    Route::post('/signin', [ExternalApiController::class, 'signIn']);
    Route::post('/create-member', [ExternalApiController::class, 'createMember']);
    
    // Member operations
    Route::get('/member-details', [ExternalApiController::class, 'getMemberDetails']);
    Route::put('/update-profile', [ExternalApiController::class, 'updateMemberProfile']);
    Route::put('/update-password', [ExternalApiController::class, 'updatePassword']);
    
    // Deposit operations
    Route::post('/deposit-manual', [ExternalApiController::class, 'depositManual']);
    Route::post('/deposit-gateway', [ExternalApiController::class, 'depositGateway']);
    
    // Withdrawal
    Route::post('/withdraw', [ExternalApiController::class, 'withdraw']);
    
    // Transactions
    Route::get('/transactions', [ExternalApiController::class, 'getTransactions']);
    
    // Wallets
    Route::post('/platform-balance', [ExternalApiController::class, 'getPlatformBalance']);
    Route::get('/platforms-balance', [ExternalApiController::class, 'getAllPlatformsBalance']);
    Route::post('/transfer-to', [ExternalApiController::class, 'transferTo']);
    Route::post('/transfer-from', [ExternalApiController::class, 'transferFrom']);
    
    // Banks
    Route::get('/system-banks', [ExternalApiController::class, 'getSystemBankAccounts']);
    Route::post('/create-bank', [ExternalApiController::class, 'createBankAccount']);
    
    // Incentives and games
    Route::get('/incentives', [ExternalApiController::class, 'getIncentives']);
    Route::post('/launch-game', [ExternalApiController::class, 'launchGame']);
    
    // CMS content
    Route::get('/cms', [ExternalApiController::class, 'getCmsContent']);
    
    // Test endpoint
    Route::match(['GET', 'POST'], '/test', [ExternalApiController::class, 'testConnection']);
}); 