<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../db.php';

// POST /backend/api/payment/pay.php
// Body: { order_id } or { orderId }
// Simulation: mark paid then completed.

$user = require_login();
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method Not Allowed', 405);
}

$payload = body_json();
if (!$payload) $payload = $_POST ?? [];

$orderId = isset($payload['order_id']) ? (int)$payload['order_id'] : (isset($payload['orderId']) ? (int)$payload['orderId'] : 0);
if ($orderId <= 0) json_error('Missing order_id', 400);

$stmt = $pdo->prepare('SELECT id FROM orders WHERE id = :id AND user_id = :uid LIMIT 1');
$stmt->execute([':id' => $orderId, ':uid' => (int)$user['id']]);
if (!$stmt->fetch()) json_error('Order not found', 404);

$stmt = $pdo->prepare(
  'UPDATE orders
   SET payment_status = :payment_status, status = :status
   WHERE id = :id'
);
$stmt->execute([
  ':payment_status' => 'paid',
  ':status' => 'completed',
  ':id' => $orderId
]);

json_response([
  'ok' => true,
  'orderId' => $orderId,
  'status' => 'completed',
  'paymentStatus' => 'paid'
], 200);

