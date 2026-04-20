<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../db.php';

// GET /backend/api/orders/show.php?id=<orderId>
// Returns detailed information for a specific order

$user = require_login();
$pdo = db();

$orderId = param_int('id');
if ($orderId === null) json_error('Missing required query param: id', 400);

// Get order details with artisan info
$stmt = $pdo->prepare('
  SELECT 
    o.id,
    o.artisan_id,
    o.user_id,
    o.hours,
    o.needs,
    o.address,
    o.materials_estimate,
    o.service_fee,
    o.materials_fee,
    o.platform_fee,
    o.tax_rate,
    o.tax_fee,
    o.total_amount,
    o.payment_method,
    o.payment_status,
    o.status,
    o.created_at,
    a.name as artisan_name,
    a.service as artisan_service,
    a.category as artisan_category,
    a.rating as artisan_rating,
    a.avatar_url as artisan_avatar,
    a.city as artisan_city,
    a.state as artisan_state
  FROM orders o
  LEFT JOIN artisans a ON a.id = o.artisan_id
  WHERE o.id = :id AND o.user_id = :uid
  LIMIT 1
');
$stmt->execute([':id' => $orderId, ':uid' => (int)$user['id']]);
$order = $stmt->fetch();

if (!$order) json_error('Order not found', 404);

// Get conversation for this order
$convStmt = $pdo->prepare('
  SELECT id FROM conversations 
  WHERE user_id = :uid AND artisan_id = :aid 
  LIMIT 1
');
$convStmt->execute([':uid' => (int)$user['id'], ':aid' => (int)$order['artisan_id']]);
$conversation = $convStmt->fetch();

// Format response
function format_status($status) {
  $statuses = [
    'created' => ['text' => 'Order Created', 'color' => '#6b7280', 'icon' => '📝'],
    'pending' => ['text' => 'Payment Pending', 'color' => '#f59e0b', 'icon' => '⏳'],
    'paid' => ['text' => 'Payment Confirmed', 'color' => '#10b981', 'icon' => '✅'],
    'accepted' => ['text' => 'Artisan Assigned', 'color' => '#3b82f6', 'icon' => '👷'],
    'in_progress' => ['text' => 'Work in Progress', 'color' => '#8b5cf6', 'icon' => '🔧'],
    'completed' => ['text' => 'Completed', 'color' => '#059669', 'icon' => '🎉'],
    'cancelled' => ['text' => 'Cancelled', 'color' => '#ef4444', 'icon' => '❌']
  ];
  return $statuses[$status] ?? ['text' => $status, 'color' => '#6b7280', 'icon' => '📝'];
}

function format_payment_status($status) {
  $statuses = [
    'pending' => ['text' => 'Pending', 'color' => '#f59e0b'],
    'paid' => ['text' => 'Paid', 'color' => '#10b981'],
    'failed' => ['text' => 'Failed', 'color' => '#ef4444'],
    'refunded' => ['text' => 'Refunded', 'color' => '#6b7280'],
    'awaiting-confirmation' => ['text' => 'Awaiting Confirmation', 'color' => '#f59e0b']
  ];
  return $statuses[$status] ?? ['text' => $status, 'color' => '#6b7280'];
}

$statusInfo = format_status($order['status']);
$paymentStatusInfo = format_payment_status($order['payment_status']);

$orderData = [
  'id' => (int)$order['id'],
  'artisanId' => (int)$order['artisan_id'],
  'artisanName' => $order['artisan_name'],
  'artisanService' => $order['artisan_service'],
  'artisanCategory' => $order['artisan_category'],
  'artisanRating' => $order['artisan_rating'] !== null ? (float)$order['artisan_rating'] : null,
  'artisanAvatar' => $order['artisan_avatar'],
  'artisanLocation' => trim($order['artisan_city'] . ', ' . $order['artisan_state'], ', '),
  'hours' => (int)$order['hours'],
  'needs' => $order['needs'],
  'address' => $order['address'],
  'materialsEstimate' => (int)$order['materials_estimate'],
  'serviceFee' => (int)$order['service_fee'],
  'materialsFee' => (int)$order['materials_fee'],
  'platformFee' => (int)$order['platform_fee'],
  'taxRate' => (float)$order['tax_rate'],
  'taxFee' => (int)$order['tax_fee'],
  'totalAmount' => (int)$order['total_amount'],
  'paymentMethod' => $order['payment_method'],
  'paymentStatus' => $paymentStatusInfo,
  'status' => $statusInfo,
  'statusKey' => $order['status'],
  'createdAt' => date('M j, Y h:i A', strtotime($order['created_at'])),
  'updatedAt' => date('M j, Y h:i A', strtotime($order['created_at'])),
  'conversationId' => $conversation ? (int)$conversation['id'] : null
];

json_response(['ok' => true, 'order' => $orderData]);
