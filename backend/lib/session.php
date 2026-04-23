<?php
/**
 * Secure session configuration for HTTPS deployment
 */

function start_secure_session(): void {
    // Set secure cookie parameters for HTTPS
    session_set_cookie_params([
        'lifetime' => 0,        // Session cookie
        'path' => '/',         // Available across entire site
        'secure' => true,      // Only send over HTTPS
        'httponly' => true,    // Not accessible via JavaScript
        'samesite' => 'None'  // Required for cross-origin requests
    ]);
    
    session_start();
}

function destroy_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}

function regenerate_session_id(): void {
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }
}
