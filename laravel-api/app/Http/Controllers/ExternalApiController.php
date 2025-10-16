<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ExternalApiController extends Controller
{
    private string $apiBaseUrl;
    private ?string $bearerToken;
    private int $timeout;
    private string $registerBaseUrl;

    public function __construct()
    {
        $this->apiBaseUrl = env('EXTERNAL_API_BASE_URL', 'http://api.dewamalaya33.com/api');
        $this->bearerToken = env('EXTERNAL_API_BEARER_TOKEN', '');
        $this->timeout = 30; // 30 seconds timeout
        $this->registerBaseUrl = env('EXTERNAL_REGISTER_BASE_URL', 'https://api.lbangdeyi.top');
    }

    /**
     * Test API connection
     */
    public function testConnection(): JsonResponse
    {
        try {
            $response = $this->makeApiCall('GET', '');
            
            return response()->json([
                'success' => true,
                'message' => 'API connection successful',
                'data' => $response
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'API connection failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Member Authentication (New API)
     */
    public function signIn(Request $request): JsonResponse
    {
        $request->validate([
            'usr' => 'required|string',
            'pwd' => 'required|string'
        ]);

        try {
            $payload = [
                'usr' => $request->usr,
                'pwd' => $request->pwd
            ];

            $url = rtrim($this->registerBaseUrl, '/') . '/api/members/signin';

            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'User-Agent' => 'Laravel-API-Proxy/1.0'
                ])
                ->post($url, $payload);

            if (!$response->successful()) {
                throw new Exception("Signin API request failed with status {$response->status()}: {$response->body()}");
            }

            $json = $response->json();
            if ($json === null) {
                throw new Exception('Signin API returned invalid JSON response');
            }

            // Normalize token field for frontend compatibility
            $token = $json['user_jwt'] ?? ($json['access_token'] ?? null);

            return response()->json([
                'success' => true,
                'data' => array_merge($json, [ 'access_token' => $token ])
            ]);
        } catch (Exception $e) {
            Log::error('Sign in error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed: ' . $e->getMessage()
            ], 401);
        }
    }

    /**
     * Create Member (New API)
     * Host: https://api.lbangdeyi.top
     * Path: /api/members/create
     * Body: { usr: string, pwd: string, referral?: string(6) }
     */
    public function createMember(Request $request): JsonResponse
    {
        $request->validate([
            'usr' => 'required|string',
            'pwd' => 'required|string',
            'referral' => 'nullable|string|size:6'
        ]);

        try {
            $payload = [
                'usr' => $request->usr,
                'pwd' => $request->pwd,
                // Use provided referral or fallback to test code if configured
                'referral' => $request->referral ?? env('REGISTER_REFERRAL_DEFAULT', 'MQBHNF')
            ];

            $url = rtrim($this->registerBaseUrl, '/') . '/api/members/create';

            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'User-Agent' => 'Laravel-API-Proxy/1.0'
                ])
                ->post($url, $payload);

            if (!$response->successful()) {
                throw new Exception("Register API request failed with status {$response->status()}: {$response->body()}");
            }

            $json = $response->json();
            if ($json === null) {
                throw new Exception('Register API returned invalid JSON response');
            }

            return response()->json([
                'success' => true,
                'data' => $json
            ]);
        } catch (Exception $e) {
            Log::error('Create member error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Member creation failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get Member Details
     */
    public function getMemberDetails(Request $request): JsonResponse
    {
        // Temporary local profile (external API disabled)
        try {
            $username = 'Member';
            $authHeaderToken = $request->bearerToken();
            if ($authHeaderToken) {
                $parts = explode('.', $authHeaderToken);
                if (count($parts) >= 2) {
                    $payloadJson = base64_decode(strtr($parts[1], '-_', '+/'));
                    $payloadArr = json_decode($payloadJson, true);
                    if (is_array($payloadArr)) {
                        $username = $payloadArr['usr'] ?? $payloadArr['sub'] ?? $username;
                    }
                }
            }

            $stub = [
                'iid' => 0,
                'usr' => $username,
                'email' => '',
                'people' => 0,
                'status' => 1,
                'permalink' => '',
                'wallet' => [
                    'iid' => 0,
                    'value' => 0,
                    'bonus' => 0,
                    'account' => null,
                    'accountType' => 'wallet'
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stub
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => true,
                'data' => [
                    'iid' => 0,
                    'usr' => 'Member',
                    'email' => '',
                    'people' => 0,
                    'status' => 1,
                    'permalink' => '',
                    'wallet' => [
                        'iid' => 0,
                        'value' => 0,
                        'bonus' => 0,
                        'account' => null,
                        'accountType' => 'wallet'
                    ]
                ]
            ]);
        }
    }

    /**
     * Update Member Profile
     */
    public function updateMemberProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string',
            'email' => 'nullable|email',
            'mobile' => 'nullable|string'
        ]);

        try {
            $token = $this->getAuthToken($request);
            
            $payload = array_filter([
                'name' => $request->name,
                'email' => $request->email,
                'mobile' => $request->mobile
            ]);

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'members.update',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Update profile error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Profile update failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update Member Password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'pwd' => 'required|string|min:6'
        ]);

        try {
            $token = $this->getAuthToken($request);
            
            $payload = [
                'pwd' => $request->pwd
            ];

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'members.update',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            return response()->json([
                'success' => true,
                'data' => $response,
                'message' => 'Password updated successfully'
            ]);
        } catch (Exception $e) {
            Log::error('Update password error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Password update failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Manual Deposit
     */
    public function depositManual(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'incentiveid' => 'required|integer',
            'remarks' => 'required|string'
        ]);

        try {
            $token = $this->getAuthToken($request);
            
            $payload = [
                'debit' => 3367, // Hardcoded debit field as per API docs
                'amount' => (float) $request->amount,
                'incentiveid' => $request->incentiveid,
                'remarks' => $request->remarks
            ];

            Log::info('Manual deposit payload:', $payload);

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'transactions.deposit',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            // Store transaction locally if successful
            if (isset($response['status']) && $response['status'] == 2) {
                $transactionData = [
                    'id' => $response['serial'] ?? 'DEP' . time() . rand(100, 999),
                    'date' => now()->toISOString(),
                    'type' => 'deposit',
                    'amount' => $request->amount,
                    'status' => 'completed',
                    'details' => [
                        'method' => 'manual',
                        'remarks' => $request->remarks,
                        'serial' => $response['serial'] ?? null
                    ]
                ];
                $this->storeTransactionLocally($request, $transactionData);
            }

            return response()->json([
                'success' => true,
                'data' => $response,
                'message' => 'Manual deposit request submitted successfully'
            ]);
        } catch (Exception $e) {
            Log::error('Manual deposit error: ' . $e->getMessage());
            
            // Handle specific server errors
            if (str_contains($e->getMessage(), '500')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction system error detected. The server is experiencing issues with deposit operations. Please try again later or contact support.',
                    'error_type' => 'server_error'
                ], 500);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Manual deposit failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Gateway Deposit
     */
    public function depositGateway(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'redirect' => 'nullable|url',
            'gateway' => 'nullable|string'
        ]);

        try {
            // Include user auth token for upstream API authentication
            $token = '';
            try {
                $token = $this->getAuthToken($request);
            } catch (Exception $e) {
                // token optional for some gateways; continue if not present
            }

            $payload = [
                'amount' => (float) $request->amount,
                'gateway' => $request->gateway ?: 'pay2win',
            ];

            if ($request->filled('redirect')) {
                $payload['redirect'] = $request->redirect;
            }

            // Some gateways require token in body; include if available
            if (!empty($token)) {
                $payload['user_jwt'] = $token;
            }

            $url = rtrim($this->registerBaseUrl, '/') . '/api/payment/deposit';

            $headers = [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'User-Agent' => 'Laravel-API-Proxy/1.0'
                ];
            if (!empty($token)) {
                $headers['Authorization'] = 'Bearer ' . $token;
                $headers['X-Auth-Token'] = $token;
                $headers['X-User-JWT'] = $token;
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders($headers)
                ->post($url, $payload);

            if (!$response->successful()) {
                throw new Exception("Deposit API request failed with status {$response->status()}: {$response->body()}");
            }

            $json = $response->json();
            if ($json === null) {
                throw new Exception('Deposit API returned invalid JSON response');
            }

            return response()->json([
                'success' => true,
                'data' => $json
            ]);
        } catch (Exception $e) {
            Log::error('Gateway deposit error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gateway deposit failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Withdraw
     */
    public function withdraw(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'bankid' => 'required|integer'
        ]);

        try {
            $token = $this->getAuthToken($request);
            
            $payload = [
                'amount' => (float) $request->amount,
                'bankid' => $request->bankid
            ];

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'transactions.withdraw',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            // Store transaction locally if successful
            if (isset($response['status']) && $response['status'] == 2) {
                $transactionData = [
                    'id' => $response['serial'] ?? 'WD' . time() . rand(100, 999),
                    'date' => now()->toISOString(),
                    'type' => 'withdrawal',
                    'amount' => -$request->amount, // Negative for withdrawal
                    'status' => 'completed',
                    'details' => [
                        'bankid' => $request->bankid,
                        'serial' => $response['serial'] ?? null
                    ]
                ];
                $this->storeTransactionLocally($request, $transactionData);
            }

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Withdraw error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Withdrawal failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get Transactions
     */
    public function getTransactions(Request $request): JsonResponse
    {
        try {
            $token = $this->getAuthToken($request);
            
            $payload = array_filter([
                'startDate' => $request->start_date,
                'endDate' => $request->end_date,
                'type' => $request->type,
                'status' => $request->status
            ]);

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'transactions.list',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            // Get cached local transactions for this user
            $userKey = $this->getUserKey($request);
            $localTransactions = cache()->get("user_transactions_{$userKey}", []);
            
            // Filter local transactions by date range if specified
            if ($request->start_date || $request->end_date) {
                $startDate = $request->start_date ? new \DateTime($request->start_date) : null;
                $endDate = $request->end_date ? new \DateTime($request->end_date) : null;
                
                $localTransactions = array_filter($localTransactions, function ($transaction) use ($startDate, $endDate) {
                    $transactionDate = new \DateTime($transaction['date']);
                    
                    if ($startDate && $transactionDate < $startDate) {
                        return false;
                    }
                    
                    if ($endDate && $transactionDate > $endDate) {
                        return false;
                    }
                    
                    return true;
                });
            }

            // Merge API response with local transactions
            $allTransactions = is_array($response) ? $response : [];
            
            // Add local transactions that aren't in the API response
            foreach ($localTransactions as $localTransaction) {
                $exists = false;
                foreach ($allTransactions as $apiTransaction) {
                    if (isset($apiTransaction['id']) && $apiTransaction['id'] === $localTransaction['id']) {
                        $exists = true;
                        break;
                    }
                }
                
                if (!$exists) {
                    array_unshift($allTransactions, $localTransaction);
                }
            }

            // Sort by date (newest first)
            usort($allTransactions, function ($a, $b) {
                $dateA = strtotime($a['date'] ?? '');
                $dateB = strtotime($b['date'] ?? '');
                return $dateB - $dateA;
            });

            return response()->json([
                'success' => true,
                'data' => $allTransactions
            ]);
        } catch (Exception $e) {
            Log::error('Get transactions error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get transactions: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Store Transaction Locally (for caching recent transactions)
     */
    private function storeTransactionLocally(Request $request, array $transactionData): void
    {
        try {
            $userKey = $this->getUserKey($request);
            $cacheKey = "user_transactions_{$userKey}";
            
            // Get existing transactions
            $existingTransactions = cache()->get($cacheKey, []);
            
            // Add new transaction to the beginning
            array_unshift($existingTransactions, $transactionData);
            
            // Keep only last 50 transactions to prevent cache bloat
            $existingTransactions = array_slice($existingTransactions, 0, 50);
            
            // Store for 24 hours
            cache()->put($cacheKey, $existingTransactions, now()->addHours(24));
            
        } catch (Exception $e) {
            Log::warning('Failed to store transaction locally: ' . $e->getMessage());
        }
    }

    /**
     * Get User Key for caching
     */
    private function getUserKey(Request $request): string
    {
        $token = $this->getAuthToken($request);
        return md5($token); // Use token hash as user identifier
    }

    /**
     * Get Platform Balance
     */
    public function getPlatformBalance(Request $request): JsonResponse
    {
        $request->validate([
            'platformid' => 'required|integer'
        ]);

        try {
            $token = $this->getAuthToken($request);
            
            $payload = [
                'platformid' => $request->platformid
            ];

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'platforms.balance',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Get platform balance error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get platform balance: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get All Platforms Balance
     */
    public function getAllPlatformsBalance(Request $request): JsonResponse
    {
        try {
            $token = $this->getAuthToken($request);
            
            $encodedPayload = base64_encode('');
            $requestBody = [
                'endpoint' => 'platforms.balances',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Get all platforms balance error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get all platforms balance: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Transfer To Platform
     */
    public function transferTo(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'platformto' => 'required|integer'
        ]);

        try {
            $token = $this->getAuthToken($request);
            
            $payload = [
                'amount' => (float) $request->amount,
                'platformto' => $request->platformto
            ];

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'transactions.transferto',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            // Store transaction locally if successful
            if (isset($response['status']) && $response['status'] == 2) {
                $transactionData = [
                    'id' => $response['serial'] ?? 'TX' . time() . rand(100, 999),
                    'date' => now()->toISOString(),
                    'type' => 'transfer',
                    'amount' => -$request->amount, // Negative for transfer to platform
                    'status' => 'completed',
                    'details' => [
                        'platform' => 'Platform ' . $request->platformto,
                        'serial' => $response['serial'] ?? null,
                        'direction' => 'to'
                    ]
                ];
                $this->storeTransactionLocally($request, $transactionData);
            }

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Transfer to error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Transfer failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Transfer From Platform
     */
    public function transferFrom(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'platformfrom' => 'required|integer'
        ]);

        try {
            $token = $this->getAuthToken($request);
            
            $payload = [
                'amount' => (float) $request->amount,
                'platformfrom' => $request->platformfrom
            ];

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'transactions.transferfrom',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            // Store transaction locally if successful
            if (isset($response['status']) && $response['status'] == 2) {
                $transactionData = [
                    'id' => $response['serial'] ?? 'TX' . time() . rand(100, 999),
                    'date' => now()->toISOString(),
                    'type' => 'transfer',
                    'amount' => $request->amount, // Positive for transfer from platform
                    'status' => 'completed',
                    'details' => [
                        'platform' => 'Platform ' . $request->platformfrom,
                        'serial' => $response['serial'] ?? null,
                        'direction' => 'from'
                    ]
                ];
                $this->storeTransactionLocally($request, $transactionData);
            }

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Transfer from error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Transfer failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get Bank Accounts
     */
    public function getSystemBankAccounts(): JsonResponse
    {
        // Temporary empty list (external API disabled)
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    /**
     * Create Bank Account
     */
    public function createBankAccount(Request $request): JsonResponse
    {
        $request->validate([
            'bankid' => 'required|integer',
            'name' => 'required|string',
            'accountnumber' => 'required|string'
        ]);

        try {
            $token = $this->getAuthToken($request);
            
            $payload = [
                'bankid' => $request->bankid,
                'name' => $request->name,
                'accountnumber' => $request->accountnumber
            ];

            $encodedPayload = base64_encode(json_encode($payload));
            $requestBody = [
                'endpoint' => 'banks.accountcreate',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody, $token);

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Create bank account error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Bank account creation failed: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get Incentives
     */
    public function getIncentives(Request $request): JsonResponse
    {
        // Temporary empty incentives (external API disabled)
        return response()->json([
            'success' => true,
            'data' => [ 'system' => [] ]
        ]);
    }

    /**
     * Launch Game (New API)
     * Host: https://api.lbangdeyi.top
     * Path: /api/platform/launch
     * Body: { platformid: int }
     * Response: { url: string }
     */
    public function launchGame(Request $request): JsonResponse
    {
        $request->validate([
            'platformid' => 'required|integer'
        ]);

        try {
            $token = $this->getAuthToken($request);

            $base = rtrim($this->registerBaseUrl, '/');
            $candidatePaths = [
                '/api/platform/launch',
                '/api/platforms/launch',
                '/platform/launch',
            ];

            $headers = [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'User-Agent' => 'Laravel-API-Proxy/1.0',
                'Authorization' => 'Bearer ' . $token,
                'X-Auth-Token' => $token,
                'X-User-JWT' => $token,
            ];

            $json = null;
            $lastStatus = 0;
            $lastBody = '';
            foreach ($candidatePaths as $path) {
                $url = $base . $path;
                Log::info('Launch game: trying upstream URL', ['url' => $url]);
                $payload = [ 'platformid' => (int) $request->platformid, 'user_jwt' => $token ];
                $upstream = Http::timeout($this->timeout)
                    ->withHeaders($headers)
                    ->post($url, $payload);
                $lastStatus = $upstream->status();
                $lastBody = $upstream->body();
                if ($upstream->successful()) {
                    $json = $upstream->json();
                    break;
                }
                if ($lastStatus !== 404) {
                    break;
                }
            }

            if ($json === null) {
                throw new Exception("Launch game API request failed with status {$lastStatus}: {$lastBody}");
            }

            if ($json === null) {
                throw new Exception('Launch game API returned invalid JSON response');
            }

            // Normalize to { url } from common shapes
            $launchUrl = null;
            if (is_array($json)) {
                $launchUrl = $json['url']
                    ?? ($json['Url'] ?? null)
                    ?? ($json['launch']['Url'] ?? null)
                    ?? ($json['launch']['url'] ?? null)
                    ?? ($json['data']['url'] ?? null)
                    ?? ($json['data']['Url'] ?? null)
                    ?? ($json['data']['launch']['Url'] ?? null)
                    ?? ($json['data']['launch']['url'] ?? null)
                    ?? ($json['result']['url'] ?? null)
                    ?? ($json['result']['launch']['Url'] ?? null)
                    ?? ($json['redirect'] ?? null)
                    ?? ($json['redirect_url'] ?? null)
                    ?? ($json['launch_url'] ?? null);
            }

            Log::info('Launch game upstream normalized URL', ['url' => $launchUrl]);

            return response()->json([
                'success' => true,
                'data' => [ 'url' => $launchUrl, 'raw' => $json ]
            ]);
        } catch (Exception $e) {
            Log::error('Launch game error: ' . $e->getMessage());
            // Reflect upstream HTTP status when present (so frontend sees 500, 401, etc.)
            $status = 400;
            if (preg_match('/status\s(\d{3})/i', $e->getMessage(), $m)) {
                $status = (int) $m[1];
            }
            return response()->json([
                'success' => false,
                'message' => 'Game launch failed: ' . $e->getMessage()
            ], $status);
        }
    }

    /**
     * Get CMS Content and Promotions
     */
    public function getCmsContent(): JsonResponse
    {
        try {
            $encodedPayload = base64_encode('{}');
            $requestBody = [
                'endpoint' => 'cms.cms',
                'payload' => $encodedPayload
            ];

            $response = $this->makeApiCall('POST', '', $requestBody);

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::error('Get CMS content error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get CMS content: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Make API call to external service
     */
    private function makeApiCall(string $method, string $endpoint, array $data = [], ?string $token = null): array
    {
        $url = $this->apiBaseUrl . ($endpoint ? '/' . $endpoint : '');
        
        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'User-Agent' => 'Laravel-API-Proxy/1.0'
        ];

        // Use provided token or fallback to default bearer token
        $authToken = $token ?: $this->bearerToken;
        if ($authToken) {
            $headers['Authorization'] = 'Bearer ' . $authToken;
        }

        Log::info("Making {$method} request to: {$url}", [
            'headers' => $headers,
            'data' => $data
        ]);

        $httpClient = Http::withHeaders($headers)->timeout($this->timeout);
        
        // Handle different HTTP methods properly
        switch (strtoupper($method)) {
            case 'GET':
                $response = $httpClient->get($url, $data);
                break;
            case 'POST':
                $response = $httpClient->post($url, $data);
                break;
            case 'PUT':
                $response = $httpClient->put($url, $data);
                break;
            case 'DELETE':
                $response = $httpClient->delete($url, $data);
                break;
            case 'PATCH':
                $response = $httpClient->patch($url, $data);
                break;
            default:
                throw new Exception("Unsupported HTTP method: {$method}");
        }

        Log::info("API Response: Status {$response->status()}", [
            'body' => $response->body(),
            'headers' => $response->headers()
        ]);

        if (!$response->successful()) {
            $errorBody = $response->body();
            
            // Handle empty JSON responses (common with 500 errors)
            if ($response->status() === 500 && (empty($errorBody) || $errorBody === '{}')) {
                throw new Exception('Transaction system error: Server returned empty response (Status 500). The external API transaction system may be experiencing issues.');
            }
            
            throw new Exception("API request failed with status {$response->status()}: {$errorBody}");
        }

        $responseData = $response->json();
        
        if ($responseData === null) {
            throw new Exception('API returned invalid JSON response');
        }

        return $responseData;
    }

    /**
     * Extract authentication token from request
     */
    private function getAuthToken(Request $request): string
    {
        $token = $request->bearerToken() ?? $request->header('X-Auth-Token');
        
        if (!$token) {
            throw new Exception('Authentication token required');
        }

        return $token;
    }
}
