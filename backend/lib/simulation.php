<?php
/**
 * Simulation helpers for the client-only phase.
 * These utilities provide "virtual artisan behavior" until a dedicated artisan module is merged.
 */

function ensure_simulated_artisan(PDO $pdo, ?int $preferredId = null): array {
  if ($preferredId && $preferredId > 0) {
    $stmt = $pdo->prepare('SELECT id, name, service, category, avatar_url FROM artisans WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $preferredId]);
    $artisan = $stmt->fetch();
    if ($artisan) return $artisan;
  }

  // Prefer any existing artisan from DB.
  $stmt = $pdo->query('SELECT id, name, service, category, avatar_url FROM artisans ORDER BY id ASC LIMIT 1');
  $artisan = $stmt->fetch();
  if ($artisan) return $artisan;

  // Fallback: create a default simulated artisan if DB has none.
  $stmt = $pdo->prepare(
    'INSERT INTO artisans
      (name, service, category, rating, reviews, hourly_rate, price_range, avatar_url, image_url, description, city, state, tags_json)
     VALUES
      (:name, :service, :category, :rating, :reviews, :hourly_rate, :price_range, :avatar_url, :image_url, :description, :city, :state, :tags_json)'
  );
  $stmt->execute([
    ':name' => 'Auto Artisan',
    ':service' => 'General Repairs',
    ':category' => 'carpentry',
    ':rating' => 4.8,
    ':reviews' => 1,
    ':hourly_rate' => 45000,
    ':price_range' => '30-50',
    ':avatar_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    ':image_url' => 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    ':description' => 'System-generated artisan for client-side simulation.',
    ':city' => 'Lagos',
    ':state' => 'Lagos',
    ':tags_json' => '["Simulated","Verified"]'
  ]);

  $id = (int)$pdo->lastInsertId();
  return [
    'id' => $id,
    'name' => 'Auto Artisan',
    'service' => 'General Repairs',
    'category' => 'carpentry',
    'avatar_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
  ];
}

function simulated_artisan_reply_text(): string {
  $replies = [
    'Hello, I have received your request.',
    'I will start working on it shortly.',
    'Thanks for your patience. I am on it.'
  ];
  return $replies[array_rand($replies)];
}

function derive_simulated_order_status(string $createdAt, string $currentStatus): string {
  if ($currentStatus === 'paid' || $currentStatus === 'completed') {
    return $currentStatus;
  }

  $createdTs = strtotime($createdAt);
  if (!$createdTs) return $currentStatus;
  $elapsed = time() - $createdTs;

  if ($elapsed >= 300) return 'completed';      // > 5 min
  if ($elapsed >= 120) return 'in_progress';    // > 2 min
  if ($elapsed >= 60) return 'accepted';        // > 1 min
  return $currentStatus ?: 'pending';
}

