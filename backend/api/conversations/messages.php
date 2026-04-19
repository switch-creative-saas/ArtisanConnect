<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../lib/simulation.php';

// Conversation messages
// GET  /backend/api/conversations/messages.php?id=<conversationId>
// POST /backend/api/conversations/messages.php?id=<conversationId> or body { conversationId, content }

$user = require_login();
$pdo = db();

$conversationId = param_int('id');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  if ($conversationId === null) json_error('Missing required query param: id', 400);
  // Ensure conversation belongs to this user and get artisan id for simulation reply.
  $stmt = $pdo->prepare('SELECT id, artisan_id FROM conversations WHERE id = :id AND user_id = :uid LIMIT 1');
  $stmt->execute([':id' => $conversationId, ':uid' => (int)$user['id']]);
  $conv = $stmt->fetch();
  if (!$conv) json_error('Conversation not found', 404);

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

  if ($conversationId === null) {
    $conversationId = isset($payload['conversationId']) ? (int)$payload['conversationId'] : (isset($payload['id']) ? (int)$payload['id'] : null);
  }
  if ($conversationId === null) json_error('Missing conversation id', 400);

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

  // Simulated artisan auto-reply
  $replyText = simulated_artisan_reply_text();
  $stmt = $pdo->prepare(
    'INSERT INTO messages (conversation_id, sender_type, sender_id, content)
     VALUES (:cid, :sender_type, :sender_id, :content)'
  );
  $stmt->execute([
    ':cid' => (int)$conversationId,
    ':sender_type' => 'artisan',
    ':sender_id' => (int)$conv['artisan_id'],
    ':content' => $replyText
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
    ],
    'autoReply' => [
      'sender' => 'them',
      'text' => $replyText,
      'time' => date('H:i'),
      'status' => 'sent'
    ],
  ], 201);
}

json_error('Method Not Allowed', 405);

