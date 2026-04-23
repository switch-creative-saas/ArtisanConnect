<?php
require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/session.php';
require_once __DIR__ . '/../../lib/auth.php';

apply_cors_headers();
start_secure_session();

$user = current_user();
if (!$user) {
  json_error('Unauthorized', 401);
}

json_response(['ok' => true, 'user' => $user], 200);

