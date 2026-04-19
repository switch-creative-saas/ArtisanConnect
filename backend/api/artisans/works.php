<?php
require_once __DIR__ . '/../../lib/response.php';
require_once __DIR__ . '/../../lib/input.php';
require_once __DIR__ . '/../../db.php';

// GET /backend/api/artisans/works.php?id=...
$id = param_int('id');
if ($id === null) {
  json_error('Missing required query param: id', 400);
}

$pdo = db();

$stmt = $pdo->prepare('SELECT id, title, image_url
                       FROM artisan_works WHERE artisan_id = :id ORDER BY created_at DESC LIMIT 20');
$stmt->execute([':id' => $id]);
$works = $stmt->fetchAll();

json_response(['ok' => true, 'works' => array_map(function ($w) {
  return [
    'id' => (int)$w['id'],
    'title' => $w['title'],
    'image' => $w['image_url']
  ];
}, $works)]);

