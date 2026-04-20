<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../lib/simulation.php';

// POST /backend/api/conversations/create.php
// Body: { artisanId: <int> } or form data artisanId

$user = require_login();
$pdo = db();

$payload = body_json();
if (!$payload) $payload = $_POST ?? [];

$artisanId = isset($payload['artisanId']) ? (int)$payload['artisanId'] : null;
if (!$artisanId) json_error('Missing artisanId', 400);

// Ensure artisan exists
$artisan = ensure_simulated_artisan($pdo, $artisanId);

// Check if conversation already exists
$stmt = $pdo->prepare('SELECT id FROM conversations WHERE user_id = :uid AND artisan_id = :aid LIMIT 1');
$stmt->execute([':uid' => (int)$user['id'], ':aid' => $artisanId]);
$existing = $stmt->fetch();

if ($existing) {
  json_response(['ok' => true, 'conversationId' => (int)$existing['id'], 'existing' => true]);
}

// Create new conversation
$stmt = $pdo->prepare('INSERT INTO conversations (user_id, artisan_id) VALUES (:uid, :aid)');
$stmt->execute([':uid' => (int)$user['id'], ':aid' => $artisanId]);

$conversationId = (int)$pdo->lastInsertId();

// Add welcome message from artisan
$welcomeMsg = "Hello! I'm {$artisan['name']}. How can I help you today?";
$stmt = $pdo->prepare('INSERT INTO messages (conversation_id, sender_type, sender_id, content) VALUES (:cid, :sender_type, :sender_id, :content)');
$stmt->execute([
  ':cid' => $conversationId,
  ':sender_type' => 'artisan',
  ':sender_id' => $artisanId,
  ':content' => $welcomeMsg
]);

json_response(['ok' => true, 'conversationId' => $conversationId, 'existing' => false]);
