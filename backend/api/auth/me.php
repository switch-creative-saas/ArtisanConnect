<?php
require_once __DIR__ . '/../../lib/auth.php';

$user = current_user();
if (!$user) {
  json_error('Unauthorized', 401);
}

json_response(['ok' => true, 'user' => $user], 200);

