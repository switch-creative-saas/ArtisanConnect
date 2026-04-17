<?php
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../lib/db.php';

// GET /backend/api/artisans/reviews.php?id=...
$id = param_int('id');
if ($id === null) {
  json_error('Missing required query param: id', 400);
}

$pdo = db();

$stmt = $pdo->prepare('SELECT id, reviewer_name, rating, review_text, created_at
                       FROM artisan_reviews WHERE artisan_id = :id
                       ORDER BY created_at DESC LIMIT 50');
$stmt->execute([':id' => $id]);
$reviews = $stmt->fetchAll();

json_response(['ok' => true, 'reviews' => array_map(function ($r) {
  return [
    'id' => (int)$r['id'],
    'name' => $r['reviewer_name'],
    'rating' => (float)$r['rating'],
    'text' => $r['review_text'],
    'date' => $r['created_at'] ? date('M j, Y', strtotime($r['created_at'])) : null
  ];
}, $reviews)]);

