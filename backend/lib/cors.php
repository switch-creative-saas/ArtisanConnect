<?php
/**
 * CORS helper for frontend/backend on different domains (e.g. Vercel + PHP host).
 */
function allowed_cors_origins(): array {
  $raw = getenv('CORS_ALLOW_ORIGINS') ?: '';
  $list = array_values(array_filter(array_map('trim', explode(',', $raw))));

  // Production frontend URL
  $list[] = 'https://artisan-connect-ten.vercel.app';

  // Local dev defaults.
  $list[] = 'http://127.0.0.1:8000';
  $list[] = 'http://127.0.0.1:8001';
  $list[] = 'http://localhost:8000';
  $list[] = 'http://localhost:8001';

  return array_values(array_unique($list));
}

function origin_is_allowed(string $origin, array $allowed): bool {
  if (in_array($origin, $allowed, true)) return true;

  // Optional support for Vercel preview/production frontends.
  $allowVercel = getenv('ALLOW_VERCEL_ORIGINS');
  if ($allowVercel === false || $allowVercel === '') $allowVercel = '1';
  if ($allowVercel === '1' && preg_match('/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/i', $origin)) {
    return true;
  }

  return false;
}

function apply_cors_headers(): void {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  $allowed = allowed_cors_origins();

  // Allow specific origins or allow all for testing
  if ($origin !== '' && origin_is_allowed($origin, $allowed)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
  } else {
    // For testing, allow all origins (remove this in production)
    header("Access-Control-Allow-Origin: *");
  }

  header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
}

