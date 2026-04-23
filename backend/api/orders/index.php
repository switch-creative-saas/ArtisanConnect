<?php
require_once __DIR__ . '/../../lib/cors.php';
require_once __DIR__ . '/../../lib/session.php';
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../lib/simulation.php';

apply_cors_headers();
start_secure_session();

// GET /backend/api/orders/index.php?status=completed
// Returns all real orders for logged-in user.

$user = require_login();
$pdo = db();

$statusFilter = isset($_GET['status']) ? trim((string)$_GET['status']) : '';

$sql = '
  SELECT
    o.id, o.user_id, o.artisan_id, o.hours, o.needs, o.address,
    o.materials_estimate, o.service_fee, o.materials_fee, o.platform_fee, o.tax_rate, o.tax_fee,
    o.total_amount, o.payment_method, o.payment_status, o.status, o.created_at,
    a.name AS artisan_name, a.service AS artisan_service, a.avatar_url AS artisan_avatar,
    c.id AS conversation_id
  FROM orders o
  LEFT JOIN artisans a ON a.id = o.artisan_id
  LEFT JOIN conversations c ON c.user_id = o.user_id AND c.artisan_id = o.artisan_id
  WHERE o.user_id = :uid
  ORDER BY o.created_at DESC, o.id DESC
';

$stmt = $pdo->prepare($sql);
$stmt->execute([':uid' => (int)$user['id']]);
$rows = $stmt->fetchAll();

$orders = array_map(function ($o) {
  $status = (string)$o['status'];
  $paymentStatus = (string)$o['payment_status'];

  return [
    'id' => (int)$o['id'],
    'artisanId' => (int)$o['artisan_id'],
    'artisanName' => $o['artisan_name'] ?: 'Artisan',
    'artisanAvatar' => $o['artisan_avatar'] ?: null,
    'artisanService' => $o['artisan_service'] ?: 'Service',
    'service' => $o['artisan_service'] ?: 'Service', // legacy key for older views
    'hours' => (int)$o['hours'],
    'needs' => $o['needs'],
    'details' => $o['needs'], // legacy key
    'address' => $o['address'],
    'status' => ucwords(str_replace('_', ' ', $status)),
    'statusKey' => $status,
    'paymentStatus' => ucwords(str_replace('-', ' ', $paymentStatus)),
    'paymentStatusKey' => $paymentStatus,
    'amount' => (int)$o['total_amount'], // legacy key
    'totalAmount' => (int)$o['total_amount'],
    'createdAt' => $o['created_at'],
    'conversationId' => $o['conversation_id'] !== null ? (int)$o['conversation_id'] : null
  ];
}, $rows);

if ($statusFilter !== '') {
  $orders = array_values(array_filter($orders, function ($o) use ($statusFilter) {
    $wanted = strtolower((string)$statusFilter);
    return strtolower((string)$o['statusKey']) === $wanted || strtolower((string)$o['status']) === $wanted;
  }));
}

json_response([
  'ok' => true,
  'orders' => $orders
], 200);

