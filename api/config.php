<?php
// Database connection details
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root'); // Default XAMPP MySQL username
define('DB_PASSWORD', '');     // Default XAMPP MySQL password (empty)
define('DB_NAME', 'casino_db'); // The database name you just created

// Attempt to connect to MySQL database
try {
    $pdo = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USERNAME, DB_PASSWORD);
    // Set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // You can set the fetch mode to associative arrays by default
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage());
}
?>