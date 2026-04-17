<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../lib/db.php';

// Conversation messages
// GET  /backend/api/conversations/messages.php?id=<conversationId>
// POST /backend/api/conversations/messages.php?id=<conversationId>

$user = require_login();
$pdo = db();

$conversationId = param_int('id');
if ($conversationId === null) json_error('Missing required query param: id', 400);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // Ensure conversation belongs to this user
  $stmt = $pdo->prepare('SELECT id FROM conversations WHERE id = :id AND user_id = :uid LIMIT 1');
  $stmt->execute([':id' => $conversationId, ':uid' => (int)$user['id']]);
  if (!$stmt->fetch()) json_error('Conversation not found', 404);

  $stmt = $pdo->prepare(
    'SELECT id, sender_type, content, created_at
     FROM messages
     WHERE conversation_id = :cid
     ORDER BY created_at ASC, id ASC'
  );
  $stmt->execute([':cid' => (int)$conversationId]);
  $rows = $stmt->fetchAll();

  function format_msg_time(?string $dt): string {
    if (!$dt) return '—';
    $ts = strtotime($dt);
    if (!$ts) return '—';
    $now = time();
    $diff = $now - $ts;
    if ($diff < 60 * 5) return 'Just now';
    if ($diff < 60 * 60 * 24) return date('H:i');
    return date('M j');
  }

  $messages = array_map(function ($m) {
    $senderType = $m['sender_type'];
    $sender = $senderType === 'user' ? 'me' : 'them'; // system & artisan => show as received
    return [
      'id' => (int)$m['id'],
      'sender' => $sender,
      'text' => $m['content'],
      'time' => format_msg_time($m['created_at']),
      'status' => 'sent'
    ];
  }, $rows);

  json_response(['ok' => true, 'messages' => $messages], 200);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $payload = body_json();
  if (!$payload) $payload = $_POST ?? [];

  $content = isset($payload['content']) ? trim((string)$payload['content']) : '';
  if ($content === '') json_error('Missing message content', 400);

  // Ensure conversation belongs to this user
  $stmt = $pdo->prepare('SELECT id FROM conversations WHERE id = :id AND user_id = :uid LIMIT 1');
  $stmt->execute([':id' => $conversationId, ':uid' => (int)$user['id']]);
  if (!$stmt->fetch()) json_error('Conversation not found', 404);

  $stmt = $pdo->prepare(
    'INSERT INTO messages (conversation_id, sender_type, sender_id, content)
     VALUES (:cid, :sender_type, :sender_id, :content)'
  );
  $stmt->execute([
    ':cid' => (int)$conversationId,
    ':sender_type' => 'user',
    ':sender_id' => (int)$user['id'],
    ':content' => $content
  ]);

  $messageId = (int)$pdo->lastInsertId();
  $stmt = $pdo->prepare(
    'SELECT id, sender_type, content, created_at
     FROM messages WHERE id = :id LIMIT 1'
  );
  $stmt->execute([':id' => $messageId]);
  $m = $stmt->fetch();

  json_response([
    'ok' => true,
    'message' => [
      'id' => (int)$m['id'],
      'sender' => 'me',
      'text' => $m['content'],
      'time' => date('H:i'),
      'status' => 'sent'
    ]
  ], 201);
}

json_error('Method Not Allowed', 405);

