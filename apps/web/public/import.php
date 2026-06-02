<?php
header('Content-Type: text/plain');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$db_host = 'localhost';
$db_user = 'evobrandconcepts_keisha';
$db_pass = 'P[x_.?-G1y?S&yyu';
$db_name = 'evobrandconcepts_9';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected to MySQL!\n";

$file_path = __DIR__ . '/mailster.xls';
if (!file_exists($file_path)) {
    die("mailster.xls not found!");
}

$content = file_get_contents($file_path);
preg_match_all('/<mailster:Row>[\s\S]*?<\/mailster:Row>/', $content, $row_matches);

if (empty($row_matches[0])) {
    die("No rows found.");
}

$imported = 0;

// Fetch lists
$lists_result = $conn->query("SELECT id, name FROM crm_lists");
$list_map = [];
while ($row = $lists_result->fetch_assoc()) {
    $list_map[strtolower(trim($row['name']))] = $row['id'];
}

foreach ($row_matches[0] as $row_html) {
    preg_match_all('/<mailster:Data[^>]*>(.*?)<\/mailster:Data>/s', $row_html, $cell_matches);
    $cells = $cell_matches[1];
    
    if (count($cells) < 15) continue;
    
    $email = trim($cells[1]);
    $firstName = trim($cells[2]);
    $lastName = trim($cells[3]);
    $status = trim($cells[13]);
    $listsStr = trim($cells[14]);
    
    if (empty($email) || strpos($email, '@') === false) continue;
    if (strtolower($status) !== 'subscribed') continue;
    
    $listNames = $listsStr ? array_filter(array_map('trim', explode(',', $listsStr))) : ['Newsletter'];
    
    foreach ($listNames as $lName) {
        $lNameLower = strtolower($lName);
        if (!isset($list_map[$lNameLower])) {
            $stmt = $conn->prepare("INSERT INTO crm_lists (name) VALUES (?)");
            $stmt->bind_param("s", $lName);
            $stmt->execute();
            $list_map[$lNameLower] = $stmt->insert_id;
            $stmt->close();
        }
        $listId = $list_map[$lNameLower];
        
        $stmt = $conn->prepare("INSERT INTO crm_contacts (email, first_name, last_name, list_id, status) VALUES (?, ?, ?, ?, 'subscribed') ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), status='subscribed'");
        $stmt->bind_param("sssi", $email, $firstName, $lastName, $listId);
        if ($stmt->execute()) {
            $imported++;
        } else {
            echo "Failed to insert $email: " . $stmt->error . "\n";
        }
        $stmt->close();
    }
}

echo "Successfully imported/updated $imported list memberships.\n";
$conn->close();
?>
