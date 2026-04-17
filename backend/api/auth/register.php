<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/input.php';

session_start_if_needed();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method Not Allowed', 405);
}

$payload = body_json();
// Optional fallback if frontend sends form-encoded data.
if (!$payload) {
  $payload = $_POST ?? [];
}

$name = isset($payload['name']) ? trim((string)$payload['name']) : '';
$email = isset($payload['email']) ? trim((string)$payload['email']) : '';
$password = isset($payload['password']) ? (string)$payload['password'] : '';

if ($name === '' || $email === '' || $password === '') {
  json_error('Missing required fields: name, email, password', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  json_error('Invalid email address', 400);
}

if (strlen($password) < 6) {
  json_error('Password must be at least 6 characters', 400);
}

$pdo = db();

// Check email uniqueness.
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$stmt->execute([':email' => $email]);
if ($stmt->fetch()) {
  json_error('Email already registered', 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

try {
  $stmt = $pdo->prepare(
    'INSERT INTO users (name, email, password_hash, avatar_url, created_at)
     VALUES (:name, :email, :password_hash, :avatar_url, NOW())'
  );
  $stmt->execute([
    ':name' => $name,
    ':email' => $email,
    ':password_hash' => $hash,
    ':avatar_url' => null
  ]);
} catch (PDOException $e) {
  // In case unique constraints exist at the DB level.
  json_error('Could not register user', 500, ['detail' => $e->getMessage()]);
}

$userId = (int)$pdo->lastInsertId();
$_SESSION['user_id'] = $userId;

$stmt = $pdo->prepare('SELECT id, name, email, avatar_url FROM users WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $userId]);
$user = $stmt->fetch();

json_response(['ok' => true, 'user' => $user], 200);

