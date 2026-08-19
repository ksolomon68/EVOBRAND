<?php
header('Content-Type: text/plain');

$repo_crm = '/home/evobrandconcepts/repositories/EVOBRAND/apps/api/src/routes/crm.js';
if (file_exists($repo_crm)) {
    echo "=== REPOSITORY crm.js ===\n";
    echo file_get_contents($repo_crm);
} else {
    echo "REPOSITORY crm.js NOT FOUND at $repo_crm\n";
}

$live_crm = '/home/evobrandconcepts/EVOBRAND/apps/api/src/routes/crm.js';
if (file_exists($live_crm)) {
    echo "\n=== LIVE crm.js ===\n";
    echo file_get_contents($live_crm);
} else {
    echo "\nLIVE crm.js NOT FOUND at $live_crm\n";
}

$crash = '/home/evobrandconcepts/EVOBRAND/apps/api/src/crash.log';
if (file_exists($crash)) {
    echo "\n=== crash.log ===\n";
    echo file_get_contents($crash);
}
?>
