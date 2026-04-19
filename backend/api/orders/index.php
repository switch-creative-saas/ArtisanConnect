<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../lib/simulation.php';

// GET /backend/api/orders/index.php?status=completed
// Returns all orders for logged-in user and simulates lifecycle progression.

$user = require_login();
$pdo = db();

$statusFilter = isset($_GET['status']) ? trim((string)$_GET['status']) : '';

$sql = '
  SELECT
    o.id, o.user_id, o.artisan_id, o.hours, o.needs, o.address,
    o.materials_estimate, o.service_fee, o.materials_fee, o.platform_fee, o.tax_rate, o.tax_fee,
    o.total_amount, o.payment_method, o.payment_status, o.status, o.created_at,
    a.name AS artisan_name, a.service AS artisan_service, a.avatar_url AS artisan_avatar
  FROM orders o
  LEFT JOIN artisans a ON a.id = o.artisan_id
  WHERE o.user_id = :uid
  ORDER BY o.created_at DESC, o.id DESC
';

$stmt = $pdo->prepare($sql);
$stmt->execute([':uid' => (int)$user['id']]);
$rows = $stmt->fetchAll();

// Simulate status progression based on elapsed time.
foreach ($rows as &$row) {
  $current = (string)$row['status'];
  $next = derive_simulated_order_status((string)$row['created_at'], $current);
  if ($next !== $current) {
    $upd = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id');
    $upd->execute([':status' => $next, ':id' => (int)$row['id']]);
    $row['status'] = $next;
  }
}
unset($row);

$orders = array_map(function ($o) {
  return [
    'id' => (int)$o['id'],
    'artisanId' => (int)$o['artisan_id'],
    'artisanName' => $o['artisan_name'] ?: 'Artisan',
    'artisanAvatar' => $o['artisan_avatar'] ?: null,
    'service' => $o['artisan_service'] ?: 'Service',
    'hours' => (int)$o['hours'],
    'details' => $o['needs'],
    'address' => $o['address'],
    'status' => $o['status'],
    'paymentStatus' => $o['payment_status'],
    'amount' => (int)$o['total_amount'],
    'createdAt' => $o['created_at'],
  ];
}, $rows);

if ($statusFilter !== '') {
  $orders = array_values(array_filter($orders, function ($o) use ($statusFilter) {
    return strtolower((string)$o['status']) === strtolower($statusFilter);
  }));
}

json_response([
  'ok' => true,
  'orders' => $orders
], 200);

