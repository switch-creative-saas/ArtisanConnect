<?php
require_once __DIR__ . '/../../lib/auth.php';

logout_user();
json_response(['ok' => true], 200);

