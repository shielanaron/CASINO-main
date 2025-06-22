<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php'; // Include the database configuration

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$response = ['success' => false, 'message' => 'An unknown error occurred.'];

if ($data === null) {
    http_response_code(400);
    $response['message'] = 'Invalid JSON input.';
} else {
    $email = trim($data['email'] ?? '');
    $username = trim($data['username'] ?? '');
    $password = trim($data['password'] ?? '');

    if (empty($email) || empty($username) || empty($password)) {
        http_response_code(400);
        $response['message'] = 'Please provide all required fields (email, username, password).';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        $response['message'] = 'Invalid email format.';
    } else {
        // Prepare a select statement to check if email already exists
        $sql = "SELECT id FROM users WHERE email = :email";

        if ($stmt = $pdo->prepare($sql)) {
            $stmt->bindParam(":email", $email, PDO::PARAM_STR);

            if ($stmt->execute()) {
                if ($stmt->rowCount() == 1) {
                    http_response_code(409); // Conflict
                    $response['message'] = 'User with this email already exists.';
                } else {
                    // Email is unique, now insert the new user
                    $hashed_password = password_hash($password, PASSWORD_BCRYPT); // Hash the password!

                    $sql = "INSERT INTO users (email, username, password) VALUES (:email, :username, :password)";

                    if ($stmt = $pdo->prepare($sql)) {
                        $stmt->bindParam(":email", $email, PDO::PARAM_STR);
                        $stmt->bindParam(":username", $username, PDO::PARAM_STR);
                        $stmt->bindParam(":password", $hashed_password, PDO::PARAM_STR);

                        if ($stmt->execute()) {
                            http_response_code(201); // Created
                            $response['success'] = true;
                            $response['message'] = 'Sign-up successful! You can now sign in.';
                        } else {
                            http_response_code(500);
                            $response['message'] = 'Something went wrong during registration.';
                        }
                    }
                }
            } else {
                http_response_code(500);
                $response['message'] = 'Database query failed.';
            }
        }
        unset($stmt); // Close statement
    }
}

echo json_encode($response);
unset($pdo); // Close connection
?>