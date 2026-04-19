<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../lib/simulation.php';

// POST /backend/api/conversations/start.php
// Body: { artisanId } or { artisan_id }
// Returns a conversation id for the logged-in user + artisan.

$user = require_login();
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method Not Allowed', 405);
}

$payload = body_json();
if (!$payload) $payload = $_POST ?? [];

$artisanId = isset($payload['artisanId']) ? (int)$payload['artisanId'] : (isset($payload['artisan_id']) ? (int)$payload['artisan_id'] : 0);
$artisan = ensure_simulated_artisan($pdo, $artisanId > 0 ? $artisanId : null);

$stmt = $pdo->prepare(
  'INSERT INTO conversations (user_id, artisan_id)
   VALUES (:user_id, :artisan_id)
   ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)'
);
$stmt->execute([
  ':user_id' => (int)$user['id'],
  ':artisan_id' => (int)$artisan['id']
]);

$conversationId = (int)$pdo->lastInsertId();
if ($conversationId <= 0) {
  $stmt = $pdo->prepare('SELECT id FROM conversations WHERE user_id = :user_id AND artisan_id = :artisan_id LIMIT 1');
  $stmt->execute([
    ':user_id' => (int)$user['id'],
    ':artisan_id' => (int)$artisan['id']
  ]);
  $conversationId = (int)($stmt->fetchColumn() ?: 0);
}

if ($conversationId <= 0) {
  json_error('Could not start conversation', 500);
}

json_response([
  'ok' => true,
  'conversationId' => $conversationId,
  'artisanId' => (int)$artisan['id']
], 200);

