<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/input.php';

session_start_if_needed();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method Not Allowed', 405);
}

$payload = body_json();
if (!$payload) {
  $payload = $_POST ?? [];
}

$email = isset($payload['email']) ? trim((string)$payload['email']) : '';
$password = isset($payload['password']) ? (string)$payload['password'] : '';

if ($email === '' || $password === '') {
  json_error('Missing required fields: email, password', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_error('Invalid email address', 400);
}

$pdo = db();

$stmt = $pdo->prepare('SELECT id, name, email, password_hash, avatar_url FROM users WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
 $user = $stmt->fetch();
if (!$user || !password_verify($password, $user['password_hash'])) {
  json_error('Invalid email or password', 401);
}

$_SESSION['user_id'] = (int)$user['id'];

// Return shape expected by frontend.
json_response([
  'ok' => true,
  'user' => [
    'id' => (int)$user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'avatar_url' => $user['avatar_url']
  ]
], 200);

