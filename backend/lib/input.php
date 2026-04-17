<?php
/**
 * Helpers for reading query params + JSON request bodies.
 */
function param_str(string $key, ?string $default = null): ?string {
  if (!isset($_GET[$key])) return $default;
  $v = is_string($_GET[$key]) ? $_GET[$key] : (string)$_GET[$key];
  $v = trim($v);
  return $v === '' ? $default : $v;
}

function param_int(string $key, ?int $default = null): ?int {
  if (!isset($_GET[$key])) return $default;
  $v = $_GET[$key];
  if ($v === '' || $v === null) return $default;
  $n = filter_var($v, FILTER_VALIDATE_INT);
  return $n === false ? $default : $n;
}

function body_json(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  if (!is_array($data)) return [];
  return $data;
}

