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
    private ?string $registerBearerToken;

    public function __construct()
    {
        $this->apiBaseUrl = env('EXTERNAL_API_BASE_URL', 'http://api.dewamalaya33.com/api');
        $this->bearerToken = env('EXTERNAL_API_BEARER_TOKEN', '');
        $this->timeout = 30; // 30 seconds timeout
        // Configurable via EXTERNAL_REGISTER_BASE_URL in .env file
        $this->registerBaseUrl = env('EXTERNAL_REGISTER_BASE_URL', 'https://api.lbangdeyi.top');
        $this->registerBearerToken = env('EXTERNAL_REGISTER_BEARER_TOKEN', $this->bearerToken);
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
     * Path: /api/members/store
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

            $url = rtrim($this->registerBaseUrl, '/') . '/api/members/store';
            $headers = [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
                'User-Agent' => 'Laravel-API-Proxy/1.0',
            ];

            if (!empty($this->registerBearerToken)) {
                $headers['Authorization'] = 'Bearer ' . $this->registerBearerToken;
            }

            Log::info('Create member outbound BO request', [
                'method' => 'POST',
                'url' => $url,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'User-Agent' => 'Laravel-API-Proxy/1.0',
                    'Authorization' => !empty($this->registerBearerToken) ? 'Bearer [redacted]' : null,
                ],
                'payload' => [
                    'usr' => $payload['usr'],
                    'pwd' => '[redacted]',
                    'referral' => $payload['referral'],
                ],
            ]);

            $response = Http::timeout($this->timeout)
                ->withHeaders($headers)
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
        try {
            $token = $this->getAuthToken($request);
            $response = null;
            $lastError = null;
            $candidateUrls = $this->buildRegisterApiUrls('/api/members/index');

            $requestVariants = [
                [
                    'headers' => [
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                        'User-Agent' => 'Laravel-API-Proxy/1.0',
                        'Authorization' => 'Bearer ' . $token,
                        'X-Auth-Token' => $token,
                        'X-User-JWT' => $token,
                    ],
                    'query' => ['user_jwt' => $token],
                ],
                [
                    'headers' => [
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                        'User-Agent' => 'Laravel-API-Proxy/1.0',
                    ],
                    'query' => ['user_jwt' => $token],
                ],
                [
                    'headers' => [
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                        'User-Agent' => 'Laravel-API-Proxy/1.0',
                        'Authorization' => 'Bearer ' . $token,
                    ],
                    'query' => [],
                ],
            ];

            foreach ($requestVariants as $variant) {
                foreach ($candidateUrls as $url) {
                    $upstream = Http::timeout($this->timeout)
                        ->withHeaders($variant['headers'])
                        ->get($url, $variant['query']);

                    if ($upstream->successful()) {
                        $response = $upstream->json();
                        if ($response !== null) {
                            break 2;
                        }
                        $lastError = 'Members index API returned invalid JSON response';
                        continue;
                    }

                    $lastError = "Members index API request failed with status {$upstream->status()}: {$upstream->body()}";
                }
            }

            if (!is_array($response)) {
                throw new Exception($lastError ?: 'Members index API request failed');
            }

            $response = $response['data']
                ?? ($response['member'] ?? null)
                ?? ($response['result'] ?? null)
                ?? $response;

            if (!is_array($response)) {
                throw new Exception('Members index API returned an unexpected response shape');
            }

            $memberId = (int) ($response['member_id'] ?? $response['user_id'] ?? 0);
            $username = (string) ($response['user_usr'] ?? $response['usr'] ?? 'Member');
            $email = (string) ($response['user_email'] ?? $response['email'] ?? '');
            $people = (int) ($response['user_people'] ?? $response['people'] ?? 0);
            $status = (int) ($response['user_status'] ?? $response['status'] ?? 1);
            $creditsGame = (float) ($response['credits_game'] ?? 0);
            $creditsWallet = (float) ($response['credits_wallet'] ?? 0);
            $credits = $creditsGame + $creditsWallet;
            $bonus = (float) ($response['bonus'] ?? 0);

            $member = [
                'iid' => $memberId,
                'member_id' => $memberId,
                'user_id' => $memberId,
                'usr' => $username,
                'user_usr' => $username,
                'email' => $email,
                'user_email' => $email,
                'people' => $people,
                'user_people' => $people,
                'status' => $status,
                'user_status' => $status,
                'profile' => $response['profile'] ?? null,
                'address' => $response['address'] ?? null,
                'wallet' => [
                    'iid' => $memberId,
                    'value' => $credits,
                    'game' => $creditsGame,
                    'wallet' => $creditsWallet,
                    'bonus' => $bonus,
                    'account' => null,
                    'accountType' => 'wallet'
                ],
                'credits' => $credits,
                'credits_game' => $creditsGame,
                'credits_wallet' => $creditsWallet,
                'bonus' => $bonus,
                'raw' => $response,
            ];

            return response()->json([
                'success' => true,
                'data' => $member
            ]);
        } catch (Exception $e) {
            Log::error('Get member details error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to get member details: ' . $e->getMessage()
            ], 400);
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

            try {
                $response = $this->makeApiCall('POST', '', $requestBody, $token);
            } catch (Exception $upstreamException) {
                Log::warning('Withdraw upstream failed; creating local pending withdrawal: ' . $upstreamException->getMessage());

                $response = [
                    'status' => 0,
                    'serial' => 'WD' . time() . rand(100, 999),
                    'amount' => (float) $request->amount,
                    'bankid' => (int) $request->bankid,
                    'message' => 'Withdrawal queued locally because the upstream transaction service is unavailable.'
                ];

                $transactionData = [
                    'id' => $response['serial'],
                    'date' => now()->toISOString(),
                    'type' => 'withdrawal',
                    'amount' => -$request->amount,
                    'status' => 'pending',
                    'details' => [
                        'bankid' => $request->bankid,
                        'serial' => $response['serial'],
                        'fallback' => true
                    ]
                ];
                $this->storeTransactionLocally($request, $transactionData);
            }

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

            $platforms = $this->fetchPlatformCredentials($token);
            $platform = collect($platforms)->first(function ($platform) use ($request) {
                $platformId = $platform['platformid']
                    ?? $platform['platformId']
                    ?? $platform['platform_id']
                    ?? $platform['id']
                    ?? null;

                return (int) $platformId === (int) $request->platformid;
            });

            return response()->json([
                'success' => true,
                'data' => $platform ?? [
                    'platformid' => (int) $request->platformid,
                    'balance' => 0,
                ],
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
            $platforms = $this->fetchPlatformCredentials($token);

            return response()->json([
                'success' => true,
                'data' => $platforms,
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
     * Get Game Platform Credentials & Balance (New API)
     * Host: https://api.lbangdeyi.top
     * Path: /api/platforms/credentials
     * Method: GET
     */
    public function getPlatformCredentials(Request $request): JsonResponse
    {
        try {
            $token = $this->getAuthToken($request);
            $credentials = $this->fetchPlatformCredentials($token);

            return response()->json([
                'success' => true,
                'data' => $credentials,
                'raw' => $credentials
            ]);
        } catch (Exception $e) {
            Log::warning('Get platform credentials error: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => [],
                'raw' => null,
                'message' => 'Platform credentials unavailable'
            ]);
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
                'message' => $this->formatTransferErrorMessage($e),
                'error_type' => $this->isLegacyGatewayResolutionError($e)
                    ? 'legacy_transfer_gateway_unavailable'
                    : 'transfer_failed',
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
                'message' => $this->formatTransferErrorMessage($e),
                'error_type' => $this->isLegacyGatewayResolutionError($e)
                    ? 'legacy_transfer_gateway_unavailable'
                    : 'transfer_failed',
            ], 400);
        }
    }

    /**
     * Get system bank accounts.
     */
    public function getSystemBankAccounts(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    /**
     * Get member bank accounts
     * Host: https://api.lbangdeyi.top
     * Path: /api/banks/index
     */
    public function getBankAccounts(Request $request): JsonResponse
    {
        try {
            $response = $this->makeRegisterApiCall($request, 'GET', '/api/banks/index', [], true);

            return response()->json([
                'success' => true,
                'data' => $response
            ]);
        } catch (Exception $e) {
            Log::warning('Get bank accounts upstream failed; using local fallback: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => $this->getLocalBankAccounts($request),
                'message' => 'Loaded local bank accounts fallback'
            ]);
        }
    }

    /**
     * Create Bank Account
     * Host: https://api.lbangdeyi.top
     * Path: /api/banks/store
     * Body: { bank: string, owner: string, account: string }
     */
    public function createBankAccount(Request $request): JsonResponse
    {
        $request->validate([
            'bank' => 'required_without:bankid|string',
            'owner' => 'required_without:name|string',
            'account' => 'required_without:accountnumber|string',
            'bankid' => 'nullable',
            'name' => 'nullable|string',
            'accountnumber' => 'nullable|string'
        ]);

        try {
            $payload = [
                'bank' => $request->input('bank', $request->input('bankid')),
                'owner' => $request->input('owner', $request->input('name')),
                'account' => $request->input('account', $request->input('accountnumber'))
            ];

            try {
                $response = $this->makeRegisterApiCall($request, 'POST', '/api/banks/store', $payload, true);
            } catch (Exception $upstreamException) {
                Log::warning('Create bank account upstream failed; storing local fallback: ' . $upstreamException->getMessage());
                $response = $this->storeLocalBankAccount($request, $payload);
            }

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
     * Delete Bank Account
     * Host: https://api.lbangdeyi.top
     * Path: /api/banks/delete
     * Body: { bank_id: integer }
     */
    public function deleteBankAccount(Request $request): JsonResponse
    {
        $request->validate([
            'bank_id' => 'required_without:bankid|integer',
            'bankid' => 'nullable|integer'
        ]);

        try {
            $bankId = (int) $request->input('bank_id', $request->input('bankid'));

            try {
                $this->makeRegisterApiCall($request, 'POST', '/api/banks/delete', [
                    'bank_id' => $bankId
                ], true);
            } catch (Exception $upstreamException) {
                Log::warning('Delete bank account upstream failed; deleting local fallback: ' . $upstreamException->getMessage());
            }

            $this->deleteLocalBankAccount($request, $bankId);

            return response()->json([
                'success' => true,
                'data' => null
            ]);
        } catch (Exception $e) {
            Log::error('Delete bank account error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Bank account deletion failed: ' . $e->getMessage()
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
     * Body: { platformid: int, view: "h5"|"desktop" }
     * Response: { url: string }
     */
    public function launchGame(Request $request): JsonResponse
    {
        $request->validate([
            'platformid' => 'required|integer',
            'view' => 'required|string|in:h5,desktop'
        ]);

        try {
            $token = $this->getAuthToken($request);

            $base = rtrim($this->registerBaseUrl, '/');
            $candidatePaths = [
                '/api/platforms/launch',
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
                Log::info('Launch game: trying upstream URL', [
                    'url' => $url,
                    'platformid' => (int) $request->platformid,
                    'view' => $request->view
                ]);
                $payload = [
                    'platformid' => (int) $request->platformid,
                    'view' => $request->view
                ];
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

            if (is_string($launchUrl)) {
                $launchUrl = trim($launchUrl, " \t\n\r\0\x0B\"'");
                $launchUrl = html_entity_decode($launchUrl, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            }

            $findResponseValue = null;
            $findResponseValue = static function ($source, string $targetKey) use (&$findResponseValue) {
                if (is_string($source)) {
                    $decoded = json_decode($source, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return $findResponseValue($decoded, $targetKey);
                    }

                    return null;
                }

                if (!is_array($source)) {
                    return null;
                }

                foreach ($source as $key => $value) {
                    $normalizedKey = strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $key));
                    if ($normalizedKey === $targetKey) {
                        return $value;
                    }
                }

                foreach ($source as $value) {
                    $found = $findResponseValue($value, $targetKey);
                    if ($found !== null) {
                        return $found;
                    }
                }

                return null;
            };

            $isAppValue = $findResponseValue($json, 'isapp') ?? false;
            $isApp = $isAppValue === true
                || $isAppValue === 1
                || $isAppValue === '1'
                || (is_string($isAppValue) && strtolower($isAppValue) === 'true');
            $appUsername = $isApp ? $findResponseValue($json, 'usr') : null;
            $appPassword = $isApp ? $findResponseValue($json, 'pwd') : null;

            $queryParameterNames = [];
            if (is_string($launchUrl)) {
                $query = parse_url($launchUrl, PHP_URL_QUERY);
                if (is_string($query)) {
                    foreach (explode('&', $query) as $parameter) {
                        $parameterName = explode('=', $parameter, 2)[0] ?? '';
                        if ($parameterName !== '') {
                            $queryParameterNames[] = urldecode($parameterName);
                        }
                    }
                }
            }

            Log::info('Launch game upstream normalized URL', [
                'platformid' => (int) $request->platformid,
                'view' => $request->view,
                'isapp' => $isApp,
                'has_app_username' => is_string($appUsername) && $appUsername !== '',
                'has_app_password' => is_string($appPassword) && $appPassword !== '',
                'query_parameters' => $queryParameterNames
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $launchUrl,
                    'isapp' => $isApp,
                    'usr' => $appUsername,
                    'pwd' => $appPassword,
                    'raw' => $json
                ]
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
     * Make API call to the registration/member service.
     */
    private function makeRegisterApiCall(Request $request, string $method, string $path, array $data = [], bool $bodyTokenOnly = false): array
    {
        $token = $request->bearerToken() ?? $request->header('X-Auth-Token') ?? $request->input('user_jwt');

        if (empty($token) && str_starts_with($path, '/api/banks/')) {
            throw new Exception('Authentication token required. Please log in again.');
        }

        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'User-Agent' => 'Laravel-API-Proxy/1.0'
        ];

        if (!empty($token) && !$bodyTokenOnly) {
            $headers['Authorization'] = 'Bearer ' . $token;
            $headers['X-Auth-Token'] = $token;
            $headers['X-User-JWT'] = $token;
        }

        if (!empty($token)) {
            $data['user_jwt'] = $token;
        }

        $response = null;
        foreach ($this->buildRegisterApiUrls($path) as $url) {
            Log::info("Making {$method} request to register API: {$url}", [
                'headers' => $headers,
                'data' => $data
            ]);

            $httpClient = Http::timeout($this->timeout)->withHeaders($headers);
            $response = strtoupper($method) === 'GET'
                ? $httpClient->get($url, $data)
                : $httpClient->post($url, $data);

            Log::info("Register API Response: Status {$response->status()}", [
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                break;
            }
        }

        if (!$response || !$response->successful()) {
            throw new Exception("Register API request failed with status {$response?->status()}: {$response?->body()}");
        }

        if (trim($response->body()) === '') {
            return [];
        }

        $responseData = $response->json();
        if ($responseData === null) {
            throw new Exception('Register API returned invalid JSON response');
        }

        return $responseData;
    }

    private function buildRegisterApiUrls(string $path): array
    {
        $base = rtrim($this->registerBaseUrl, '/');
        $normalizedPath = '/' . ltrim($path, '/');
        $pathHasApiPrefix = str_starts_with($normalizedPath, '/api/');
        $rootBase = str_ends_with($base, '/api')
            ? rtrim(substr($base, 0, -4), '/')
            : $base;

        $apiPath = $pathHasApiPrefix ? $normalizedPath : '/api' . $normalizedPath;
        $rootPath = $pathHasApiPrefix ? substr($normalizedPath, 4) : $normalizedPath;
        $urls = [
            $rootBase . $apiPath,
            $rootBase . $rootPath,
        ];

        return array_values(array_unique(array_filter($urls, static fn ($url) => is_string($url) && $url !== '')));
    }

    private function fetchPlatformCredentials(string $token): array
    {
        $response = null;
        foreach ($this->buildRegisterApiUrls('/api/platforms/credentials') as $url) {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                    'User-Agent' => 'Laravel-API-Proxy/1.0',
                    'Authorization' => 'Bearer ' . $token,
                    'X-Auth-Token' => $token,
                    'X-User-JWT' => $token,
                ])
                ->get($url);

            if ($response->successful()) {
                break;
            }
        }

        if (!$response || !$response->successful()) {
            throw new Exception("Platform credentials API request failed with status {$response?->status()}: {$response?->body()}");
        }

        $json = $response->json();
        if ($json === null) {
            throw new Exception('Platform credentials API returned invalid JSON response');
        }

        if (is_array($json) && !array_is_list($json)) {
            $credentials = $json['data']
                ?? ($json['credentials'] ?? null)
                ?? ($json['platforms'] ?? null)
                ?? ($json['result'] ?? null)
                ?? [];

            return is_array($credentials) ? $credentials : [];
        }

        return is_array($json) ? $json : [];
    }

    private function isLegacyGatewayResolutionError(Exception $exception): bool
    {
        $message = $exception->getMessage();

        return str_contains($message, 'api.dewamalaya33.com')
            || str_contains($message, 'Could not resolve host');
    }

    private function formatTransferErrorMessage(Exception $exception): string
    {
        if ($this->isLegacyGatewayResolutionError($exception)) {
            return 'Transfer service is still pointing to the old gateway api.dewamalaya33.com, which cannot be resolved. Please update EXTERNAL_API_BASE_URL to a working transfer gateway or ask the provider for the new transfer API endpoint.';
        }

        return 'Transfer failed: ' . $exception->getMessage();
    }

    private function getLocalBankAccounts(Request $request): array
    {
        $accounts = $this->readLocalBankAccounts();
        $userKey = $this->getRequestUserKey($request);

        return array_values(array_map(function ($account) {
            unset($account['user_key']);
            return $account;
        }, array_filter($accounts, fn ($account) => ($account['user_key'] ?? '') === $userKey)));
    }

    private function storeLocalBankAccount(Request $request, array $payload): array
    {
        $accounts = $this->readLocalBankAccounts();
        $now = now()->toISOString();
        $nextId = empty($accounts) ? 1 : (max(array_column($accounts, 'bank_id')) + 1);

        $account = [
            'bank_id' => $nextId,
            'id' => $nextId,
            'bank' => $payload['bank'],
            'owner' => $payload['owner'],
            'account' => $payload['account'],
            'status' => 1,
            'created_at' => $now,
            'user_key' => $this->getRequestUserKey($request),
        ];

        $accounts[] = $account;
        $this->writeLocalBankAccounts($accounts);

        $publicAccount = $account;
        unset($publicAccount['user_key']);

        return $publicAccount;
    }

    private function deleteLocalBankAccount(Request $request, int $bankId): void
    {
        $userKey = $this->getRequestUserKey($request);
        $accounts = array_values(array_filter(
            $this->readLocalBankAccounts(),
            fn ($account) => !(
                ($account['user_key'] ?? '') === $userKey
                && (int) ($account['bank_id'] ?? $account['id'] ?? 0) === $bankId
            )
        ));

        $this->writeLocalBankAccounts($accounts);
    }

    private function readLocalBankAccounts(): array
    {
        $path = storage_path('app/bank-accounts.json');
        if (!file_exists($path)) {
            return [];
        }

        $data = json_decode(file_get_contents($path), true);
        return is_array($data) ? $data : [];
    }

    private function writeLocalBankAccounts(array $accounts): void
    {
        $path = storage_path('app/bank-accounts.json');
        $directory = dirname($path);
        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        file_put_contents($path, json_encode($accounts, JSON_PRETTY_PRINT));
    }

    private function getRequestUserKey(Request $request): string
    {
        $token = $request->bearerToken() ?? $request->header('X-Auth-Token') ?? $request->input('user_jwt') ?? 'guest';
        return md5($token);
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
