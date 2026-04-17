<?php
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../lib/db.php';

// GET /backend/api/artisans/index.php
// Supported (optional) query params:
// - searchTerm, category, ratingMin, priceRange, location, city, state

$pdo = db();

$searchTerm = param_str('searchTerm');
$category = param_str('category');
$ratingMin = isset($_GET['ratingMin']) && $_GET['ratingMin'] !== '' ? (float)$_GET['ratingMin'] : null;
$priceRange = param_str('priceRange');
$location = param_str('location');
$city = param_str('city');
$state = param_str('state');

$where = [];
$params = [];

if ($searchTerm) {
  $where[] = '(name LIKE :q OR service LIKE :q OR description LIKE :q OR tags_json LIKE :q)';
  $params[':q'] = '%' . $searchTerm . '%';
}

if ($category) {
  $where[] = 'category = :category';
  $params[':category'] = $category;
}

if ($ratingMin !== null && is_numeric($ratingMin)) {
  $where[] = 'rating >= :ratingMin';
  $params[':ratingMin'] = $ratingMin;
}

if ($priceRange) {
  $where[] = 'price_range = :priceRange';
  $params[':priceRange'] = $priceRange;
}

if ($city) {
  $where[] = 'city LIKE :city';
  $params[':city'] = '%' . $city . '%';
}

if ($state) {
  $where[] = 'state LIKE :state';
  $params[':state'] = '%' . $state . '%';
}

// `location` from the UI is typically free-text like "Lagos" / "Lagos, Nigeria"
if ($location) {
  $loc = strtolower($location);
  if ($loc !== 'near me' && $loc !== 'near-me' && $loc !== 'near') {
    // Very beginner-friendly: match either city or state contains this value.
    $where[] = '(city LIKE :location OR state LIKE :location)';
    $params[':location'] = '%' . $location . '%';
  }
}

$sql = 'SELECT id, name, service, category, rating, reviews, hourly_rate, price_range, avatar_url, image_url, description, city, state, lat, lng, tags_json
        FROM artisans';

if ($where) {
  $sql .= ' WHERE ' . implode(' AND ', $where);
}

// Default ordering: higher rating first (UI later re-sorts when needed)
$sql .= ' ORDER BY rating DESC, reviews DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$artisans = array_map(function ($a) {
  $tags = [];
  if (!empty($a['tags_json'])) {
    $decoded = json_decode($a['tags_json'], true);
    if (is_array($decoded)) $tags = $decoded;
  }

  $pricePerHour = isset($a['hourly_rate']) ? (int)$a['hourly_rate'] : 0;
  return [
    'id' => (int)$a['id'],
    'name' => $a['name'],
    'service' => $a['service'],
    'category' => $a['category'],
    'rating' => (float)$a['rating'],
    'reviews' => (int)$a['reviews'],
    // UI expects `price` as the "XX" part (then it multiplies by 1000)
    'price' => (int)round($pricePerHour / 1000),
    'priceRange' => $a['price_range'],
    'avatar' => $a['avatar_url'],
    'image' => $a['image_url'],
    'tags' => $tags,
    'description' => $a['description'],
    'city' => $a['city'],
    'state' => $a['state'],
    'lat' => $a['lat'] !== null ? (float)$a['lat'] : null,
    'lng' => $a['lng'] !== null ? (float)$a['lng'] : null,
  ];
}, $rows);

json_response(['ok' => true, 'artisans' => $artisans]);

