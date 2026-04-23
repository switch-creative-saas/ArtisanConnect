<?php
/**
 * Script to update all API files with CORS and secure session configuration
 * Run this script to apply fixes to all API endpoints
 */

$apiDir = __DIR__ . '/api';
$filesToUpdate = [];

// Find all PHP files in the API directory
$iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($apiDir));
foreach ($iterator as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        $filesToUpdate[] = $file->getPathname();
    }
}

echo "Found " . count($filesToUpdate) . " API files to update...\n";

$updatedFiles = [];
$skippedFiles = [];

foreach ($filesToUpdate as $file) {
    $content = file_get_contents($file);
    
    // Skip files that already have CORS headers
    if (strpos($content, 'apply_cors_headers') !== false) {
        $skippedFiles[] = $file;
        continue;
    }
    
    // Add CORS and session headers at the beginning
    $newContent = "<?php\n";
    $newContent .= "require_once __DIR__ . '/../../lib/cors.php';\n";
    $newContent .= "require_once __DIR__ . '/../../lib/session.php';\n";
    
    // Add existing requires after CORS headers
    preg_match_all('/require_once\s+[\'"].*?[\'"]\s*;/', $content, $matches);
    if (!empty($matches[0])) {
        foreach ($matches[0] as $require) {
            if (strpos($require, 'cors.php') === false && strpos($require, 'session.php') === false) {
                $newContent .= $require . "\n";
            }
        }
    }
    
    $newContent .= "\napply_cors_headers();\n";
    $newContent .= "start_secure_session();\n\n";
    
    // Add the rest of the content (skip the opening <?php and existing requires)
    $lines = explode("\n", $content);
    $skipLines = true;
    foreach ($lines as $i => $line) {
        if ($i === 0 && trim($line) === '<?php') {
            continue;
        }
        if (preg_match('/^require_once\s+[\'"].*?[\'"]\s*;$/', $line)) {
            continue;
        }
        if ($skipLines && (trim($line) === '' || preg_match('/^\/\*.*\*\/$/', $line))) {
            continue;
        }
        $skipLines = false;
        $newContent .= $line . "\n";
    }
    
    file_put_contents($file, $newContent);
    $updatedFiles[] = $file;
    echo "Updated: " . basename($file) . "\n";
}

echo "\n=== Summary ===\n";
echo "Updated files: " . count($updatedFiles) . "\n";
echo "Skipped files (already updated): " . count($skippedFiles) . "\n";
echo "Total files processed: " . count($filesToUpdate) . "\n";

if (!empty($skippedFiles)) {
    echo "\nSkipped files:\n";
    foreach ($skippedFiles as $file) {
        echo "- " . basename($file) . "\n";
    }
}

echo "\nCORS and session configuration updated successfully!\n";
?>
