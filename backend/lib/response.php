<?php
/**
 * Small JSON response helpers for beginner-friendly APIs.
 */
function json_response($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function json_error(string $message, int $status = 400, array $extra = []): void {
  $payload = array_merge(
    ['ok' => false, 'error' => $message],
    $extra ? ['extra' => $extra] : []
  );
  json_response($payload, $status);
}

