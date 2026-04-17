<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/db.php';

// GET /backend/api/conversations/index.php
$user = require_login();
$pdo = db();

$uid = (int)$user['id'];

$sql = "
SELECT
  c.id AS conversation_id,
  a.id AS artisan_id,
  a.name AS artisan_name,
  a.service AS artisan_service,
  a.avatar_url AS artisan_avatar,
  (
    SELECT m.content
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT 1
  ) AS last_message,
  (
    SELECT m.created_at
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT 1
  ) AS last_message_time
FROM conversations c
JOIN artisans a ON a.id = c.artisan_id
WHERE c.user_id = :uid
ORDER BY last_message_time DESC, c.created_at DESC
";

$stmt = $pdo->prepare($sql);
$stmt->execute([':uid' => $uid]);
$rows = $stmt->fetchAll();

function format_chat_time(?string $dt): string {
  if (!$dt) return '—';
  $ts = strtotime($dt);
  if (!$ts) return '—';
  $now = time();
  $diff = $now - $ts;
  if ($diff < 60 * 5) return 'Just now';
  if ($diff < 60 * 60 * 24) return date('H:i');
  return date('M j');
}

$conversations = array_map(function ($r) {
  return [
    'id' => (int)$r['conversation_id'],
    'artisanId' => (int)$r['artisan_id'],
    'name' => $r['artisan_name'],
    'avatar' => $r['artisan_avatar'],
    'service' => $r['artisan_service'],
    'status' => 'online',
    'lastMessage' => $r['last_message'] ?: 'Say hi to start',
    'lastMessageTime' => format_chat_time($r['last_message_time']),
    'unreadCount' => 0,
    'messages' => [] // frontend can fetch messages separately
  ];
}, $rows);

json_response(['ok' => true, 'conversations' => $conversations]);

