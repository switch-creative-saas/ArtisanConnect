<?php
// `db.php` lives one level up (backend/db.php)
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/response.php';

function session_start_if_needed(): void {
  if (session_status() === PHP_SESSION_NONE) {
    // Cookie-based auth: let browser manage session cookies.
    session_start();
  }
}

function current_user(): ?array {
  session_start_if_needed();

  $userId = $_SESSION['user_id'] ?? null;
  if (!$userId) return null;

  $pdo = db();
  $stmt = $pdo->prepare('SELECT id, name, email, avatar_url FROM users WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $userId]);
  $user = $stmt->fetch();

  return $user ?: null;
}

function require_login(): array {
  $user = current_user();
  if (!$user) json_error('Unauthorized', 401);
  return $user;
}

function logout_user(): void {
  session_start_if_needed();

  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
  }
  session_destroy();
}

