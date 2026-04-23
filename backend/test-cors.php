<?php
// Simple CORS test endpoint
require_once __DIR__ . '/lib/cors.php';

apply_cors_headers();

// Simple response to test CORS
header('Content-Type: application/json');

echo json_encode([
  'ok' => true,
  'message' => 'CORS test successful',
  'timestamp' => date('Y-m-d H:i:s'),
  'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
  'method' => $_SERVER['REQUEST_METHOD'] ?? 'none',
  'headers' => getallheaders()
]);
?>
