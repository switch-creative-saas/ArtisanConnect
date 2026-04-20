<?php
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../db.php';

// GET /backend/api/artisans/profile.php?id=<artisanId>
$artisanId = param_int('id');
if ($artisanId === null) json_error('Missing required query param: id', 400);

$pdo = db();

// Get artisan details
$stmt = $pdo->prepare('
  SELECT id, name, service, category, rating, reviews, hourly_rate, price_range,
         avatar_url, image_url, description, city, state, lat, lng, tags_json
  FROM artisans 
  WHERE id = :id LIMIT 1
');
$stmt->execute([':id' => $artisanId]);
$artisan = $stmt->fetch();

if (!$artisan) json_error('Artisan not found', 404);

// Parse tags
$tags = [];
if (!empty($artisan['tags_json'])) {
  $decoded = json_decode($artisan['tags_json'], true);
  if (is_array($decoded)) $tags = $decoded;
}

// Get artisan works
$stmt = $pdo->prepare('
  SELECT id, title, image_url, created_at
  FROM artisan_works 
  WHERE artisan_id = :id 
  ORDER BY created_at DESC
');
$stmt->execute([':id' => $artisanId]);
$works = $stmt->fetchAll();

// Get artisan reviews
$stmt = $pdo->prepare('
  SELECT id, reviewer_name, rating, review_text, created_at
  FROM artisan_reviews 
  WHERE artisan_id = :id 
  ORDER BY created_at DESC
  LIMIT 10
');
$stmt->execute([':id' => $artisanId]);
$reviews = $stmt->fetchAll();

// Format response
$artisanData = [
  'id' => (int)$artisan['id'],
  'name' => $artisan['name'],
  'service' => $artisan['service'],
  'category' => $artisan['category'],
  'rating' => (float)$artisan['rating'],
  'reviews' => (int)$artisan['reviews'],
  'hourlyRate' => (int)$artisan['hourly_rate'],
  'priceRange' => $artisan['price_range'],
  'avatar' => $artisan['avatar_url'],
  'image' => $artisan['image_url'],
  'description' => $artisan['description'],
  'city' => $artisan['city'],
  'state' => $artisan['state'],
  'location' => trim($artisan['city'] . ', ' . $artisan['state'], ', '),
  'tags' => $tags,
  'works' => array_map(function($work) {
    return [
      'id' => (int)$work['id'],
      'title' => $work['title'],
      'image' => $work['image_url'],
      'createdAt' => $work['created_at']
    ];
  }, $works),
  'reviews' => array_map(function($review) {
    return [
      'id' => (int)$review['id'],
      'reviewerName' => $review['reviewer_name'] ?: 'Anonymous',
      'rating' => (float)$review['rating'],
      'text' => $review['review_text'],
      'createdAt' => $review['created_at']
    ];
  }, $reviews)
];

json_response(['ok' => true, 'artisan' => $artisanData]);
