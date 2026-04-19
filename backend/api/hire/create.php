<?php
require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../lib/simulation.php';

// POST /backend/api/hire/create.php
// Accepts JSON or form body, supporting both:
// - artisanId / artisan_id
// - needs / details
// - hours, address, materialsEstimate, paymentMethod

session_start_if_needed();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_error('Method Not Allowed', 405);
}

$user = require_login();

$payload = body_json();
if (!$payload) $payload = $_POST ?? [];

$artisanId = isset($payload['artisanId']) ? (int)$payload['artisanId'] : (isset($payload['artisan_id']) ? (int)$payload['artisan_id'] : 0);
$hours = isset($payload['hours']) ? (int)$payload['hours'] : 0;
$needs = isset($payload['needs']) ? trim((string)$payload['needs']) : '';
$details = isset($payload['details']) ? trim((string)$payload['details']) : '';
$address = isset($payload['address']) ? trim((string)$payload['address']) : '';
$materialsEstimate = isset($payload['materialsEstimate']) ? (int)$payload['materialsEstimate'] : (isset($payload['materials_estimate']) ? (int)$payload['materials_estimate'] : 0);
$paymentMethod = isset($payload['paymentMethod']) ? (string)$payload['paymentMethod'] : (isset($payload['payment_method']) ? (string)$payload['payment_method'] : 'card');
$paymentMethod = $paymentMethod === 'transfer' ? 'transfer' : 'card';

$needs = $needs !== '' ? $needs : $details;
if ($hours <= 0) $hours = 1;
if ($needs === '') json_error('Missing needs/details', 400);

$pdo = db();

// Fetch or create simulated artisan for the client-only phase.
$artisan = ensure_simulated_artisan($pdo, $artisanId > 0 ? $artisanId : null);

$stmt = $pdo->prepare('SELECT platform_fee, tax_rate FROM categories WHERE category_key = :cat LIMIT 1');
$stmt->execute([':cat' => $artisan['category']]);
$cat = $stmt->fetch();
if (!$cat) $cat = ['platform_fee' => 5000, 'tax_rate' => 0.08];

$serviceFee = (int)round($hours * (int)$artisan['hourly_rate']);
$materialsFee = max(0, (int)$materialsEstimate);
$platformFee = (int)$cat['platform_fee'];
$taxRate = (float)$cat['tax_rate'];

$taxable = $serviceFee + $materialsFee + $platformFee;
$taxFee = (int)round($taxable * $taxRate);
$total = $taxable + $taxFee;

// Create order.
$paymentStatus = $paymentMethod === 'transfer' ? 'awaiting-confirmation' : 'pending';
$status = 'pending';

$stmt = $pdo->prepare(
  'INSERT INTO orders
   (user_id, artisan_id, hours, needs, address, materials_estimate, service_fee, materials_fee, platform_fee,
    tax_rate, tax_fee, total_amount, payment_method, payment_status, status)
   VALUES
   (:user_id, :artisan_id, :hours, :needs, :address, :materials_estimate, :service_fee, :materials_fee, :platform_fee,
    :tax_rate, :tax_fee, :total_amount, :payment_method, :payment_status, :status)'
);
$stmt->execute([
  ':user_id' => (int)$user['id'],
  ':artisan_id' => (int)$artisan['id'],
  ':hours' => (int)$hours,
  ':needs' => $needs,
  ':address' => $address,
  ':materials_estimate' => $materialsFee,
  ':service_fee' => $serviceFee,
  ':materials_fee' => $materialsFee,
  ':platform_fee' => $platformFee,
  ':tax_rate' => $taxRate,
  ':tax_fee' => $taxFee,
  ':total_amount' => $total,
  ':payment_method' => $paymentMethod,
  ':payment_status' => $paymentStatus,
  ':status' => $status
]);

$orderId = (int)$pdo->lastInsertId();

// Create or reuse conversation between this user and this artisan.
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
  // Fallback in case LAST_INSERT_ID behaved unexpectedly.
  $stmt = $pdo->prepare('SELECT id FROM conversations WHERE user_id = :user_id AND artisan_id = :artisan_id LIMIT 1');
  $stmt->execute([':user_id' => (int)$user['id'], ':artisan_id' => (int)$artisan['id']]);
  $conversationId = (int)($stmt->fetchColumn() ?: 0);
}

// Insert a notification message into the conversation.
$msgText = sprintf(
  'New hire request: "%s" · %d hour(s) · Total ₦%s.',
  $needs,
  (int)$hours,
  number_format($total, 0, '.', '')
);

$stmt = $pdo->prepare(
  'INSERT INTO messages (conversation_id, sender_type, sender_id, content)
   VALUES (:conversation_id, :sender_type, NULL, :content)'
);
$stmt->execute([
  ':conversation_id' => $conversationId,
  ':sender_type' => 'system',
  ':content' => $msgText
]);

// Auto artisan acknowledgement (simulated behavior).
$stmt = $pdo->prepare(
  'INSERT INTO messages (conversation_id, sender_type, sender_id, content)
   VALUES (:conversation_id, :sender_type, :sender_id, :content)'
);
$stmt->execute([
  ':conversation_id' => $conversationId,
  ':sender_type' => 'artisan',
  ':sender_id' => (int)$artisan['id'],
  ':content' => 'Hello, I have received your request.'
]);

json_response([
  'ok' => true,
  'orderId' => $orderId,
  'conversationId' => $conversationId,
  'pricing' => [
    'serviceFee' => $serviceFee,
    'materialsFee' => $materialsFee,
    'platformFee' => $platformFee,
    'taxRate' => $taxRate,
    'taxFee' => $taxFee,
    'total' => $total
  ]
], 200);

