<?php
header('Content-Type: text/plain');
echo "Starting installation...\n";

// Run npm install in the API directory
$output = shell_exec('cd /home/evobrandconcepts/EVOBRAND/apps/api && npm install @google/generative-ai resend --no-audit --no-fund 2>&1');
echo "NPM Output:\n" . $output . "\n\n";

// Restart the passenger apps
shell_exec('mkdir -p /home/evobrandconcepts/EVOBRAND/apps/api/tmp && touch /home/evobrandconcepts/EVOBRAND/apps/api/tmp/restart.txt');
shell_exec('mkdir -p /home/evobrandconcepts/nodeapp/tmp && touch /home/evobrandconcepts/nodeapp/tmp/restart.txt');

echo "Restarted Node applications.\nDone!";
?>
