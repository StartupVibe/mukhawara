<?php

// ===============================
// CORS (allow your frontend)
// ===============================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://mukhawara.com , http://localhost:8000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization, Store-Identifier, X-XSRF-TOKEN, XSRF-TOKEN');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ===============================
// Read incoming headers
// ===============================
$headers = getallheaders();

$authToken = $headers['Authorization'] ?? null;
$storeIdentifier = $headers['Store-Identifier'] ?? null;
//  Check if user is logged in
if (!$authToken && !isset($_COOKIE['salla_access_token'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'من فضلك سجل دخول أو أنشئ حساب أولاً'
    ]);
    exit;
}

// ===============================
// Build Salla request headers
// ===============================
$sallaHeaders = [
    'Accept: application/json',
];

if ($storeIdentifier) {
    $sallaHeaders[] = 'Store-Identifier: ' . $storeIdentifier;
}

// Normalize and forward XSRF token from incoming headers or cookie if present
$xsrf = $headers['X-XSRF-TOKEN'] ?? $headers['X-Xsrf-Token'] ?? $headers['XSRF-TOKEN'] ?? $headers['xsrf_token'] ?? $_COOKIE['XSRF-TOKEN'] ?? null;
if ($xsrf) {
    // Forward both names to cover different backend expectations
    $sallaHeaders[] = 'XSRF-TOKEN: ' . $xsrf;
    $sallaHeaders[] = 'X-XSRF-TOKEN: ' . $xsrf;
}

// Don't forward incoming site cookies to Salla (can cause 403s)
// Remove Cookie header if present
if (isset($headers['Cookie'])) {
    // intentionally not forwarding
    unset($headers['Cookie']);
}

// Use Authorization header when present; otherwise derive from salla_access_token cookie
if (!$authToken && isset($_COOKIE['salla_access_token'])) {
    $authToken = $_COOKIE['salla_access_token'];
    // Log that we derived auth from cookie when debug is enabled
    if (isset($_GET['debug']) && $_GET['debug'] == '1') {
        @mkdir(__DIR__ . '/logs', 0755, true);
        file_put_contents(__DIR__ . '/logs/cart_proxy_request.log', date('c') . " Derived Authorization from salla_access_token cookie\n", FILE_APPEND);
    }
}

if ($authToken) {
    // Ensure a Bearer prefix is present
    if (stripos($authToken, 'bearer ') === 0) {
        $sallaHeaders[] = 'Authorization: ' . $authToken;
    } else {
        $sallaHeaders[] = 'Authorization: Bearer ' . $authToken;
    }
}
// ===============================
// Call Salla API
// ===============================
$url = 'https://salla.sa/mukhaura/cart/latest?source=&callerName=salla.api.cart.addItem';

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => $sallaHeaders,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => false,  // Disables SSL verification
    CURLOPT_SSL_VERIFYHOST => 0,      // Disables host verification
]);

// Optional debug logging when ?debug=1 is present
$debugMode = isset($_GET['debug']) && $_GET['debug'] == '1';
if ($debugMode) {
    @mkdir(__DIR__ . '/logs', 0755, true);
    file_put_contents(__DIR__ . '/logs/cart_proxy_request.log', date('c') . " REQUEST HEADERS:\n" . print_r($sallaHeaders, true) . "\n", FILE_APPEND);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => curl_error($ch),
    ]);
    curl_close($ch);
    exit;
}

// Optional debug logging for responses (when ?debug=1)
if (isset($debugMode) && $debugMode && $httpCode >= 400) {
    $logPath = __DIR__ . '/logs/cart_proxy_debug.log';
    $entry = date('c') . " RESPONSE (HTTP: $httpCode):\n";
    $entry .= "SALLA URL: $url\n";
    $entry .= "RESPONSE BODY:\n" . $response . "\n\n";
    file_put_contents($logPath, $entry, FILE_APPEND);
}

curl_close($ch);

// ===============================
// Return Salla response as-is
// ===============================
http_response_code($httpCode);
echo $response;