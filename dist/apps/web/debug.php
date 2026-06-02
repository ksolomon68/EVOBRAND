<?php
header('Content-Type: text/plain');
$file = '/home/evobrandconcepts/EVOBRAND/apps/api/src/routes/crm.js';
if (file_exists($file)) {
    echo "--- crm.js ---\n";
    echo file_get_contents($file);
} else {
    echo "crm.js NOT FOUND at $file\n";
}

$index = '/home/evobrandconcepts/EVOBRAND/apps/api/src/index.js';
if (file_exists($index)) {
    echo "\n--- index.js ---\n";
    echo file_get_contents($index);
}

$crash = '/home/evobrandconcepts/EVOBRAND/apps/api/src/crash.log';
if (file_exists($crash)) {
    echo "\n--- crash.log ---\n";
    echo file_get_contents($crash);
}
?>
