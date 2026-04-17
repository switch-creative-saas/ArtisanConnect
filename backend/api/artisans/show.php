<?php
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../lib/db.php';

// GET /backend/api/artisans/show.php?id=...
$id = param_int('id');
if ($id === null) {
  json_error('Missing required query param: id', 400);
}

$pdo = db();

$stmt = $pdo->prepare('SELECT id, name, service, category, rating, reviews, hourly_rate, price_range, avatar_url, image_url, description, city, state, lat, lng, tags_json
                       FROM artisans WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
$a = $stmt->fetch();

if (!$a) {
  json_error('Artisan not found', 404);
}

$tags = [];
if (!empty($a['tags_json'])) {
  $decoded = json_decode($a['tags_json'], true);
  if (is_array($decoded)) $tags = $decoded;
}

$pricePerHour = isset($a['hourly_rate']) ? (int)$a['hourly_rate'] : 0;

json_response([
  'ok' => true,
  'artisan' => [
    'id' => (int)$a['id'],
    'name' => $a['name'],
    'service' => $a['service'],
    'category' => $a['category'],
    'rating' => (float)$a['rating'],
    'reviews' => (int)$a['reviews'],
    'price' => (int)round($pricePerHour / 1000),
    'priceRange' => $a['price_range'],
    'avatar' => $a['avatar_url'],
    'image' => $a['image_url'],
    'tags' => $tags,
    'description' => $a['description'],
    'city' => $a['city'],
    'state' => $a['state'],
    'lat' => $a['lat'] !== null ? (float)$a['lat'] : null,
    'lng' => $a['lng'] !== null ? (float)$a['lng'] : null
  ]
]);

