<?php

function db(): PDO
{
    static $pdo = null;

    if ($pdo) return $pdo;

    $host = "localhost";
    $dbname = "artisan_marketplace";
    $user = "root";
    $pass = "";

    try {
        $pdo = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $user,
            $pass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );

        return $pdo;

    } catch (PDOException $e) {
        http_response_code(500);

        echo json_encode([
            "ok" => false,
            "error" => "DB connection failed",
            "detail" => $e->getMessage()
        ]);

        exit;
    }
}