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
    $password = trim($data['password'] ?? '');

    if (empty($email) || empty($password)) {
        http_response_code(400);
        $response['message'] = 'Please enter both email and password.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        $response['message'] = 'Invalid email format.';
    } else {
        $sql = "SELECT id, email, password FROM users WHERE email = :email";

        if ($stmt = $pdo->prepare($sql)) {
            $stmt->bindParam(":email", $email, PDO::PARAM_STR);

            if ($stmt->execute()) {
                if ($stmt->rowCount() == 1) {
                    $user = $stmt->fetch();
                    $hashed_password = $user['password'];

                    // Verify password!
                    if (password_verify($password, $hashed_password)) {
                        http_response_code(200);
                        $response['success'] = true;
                        $response['message'] = 'Sign-in successful!';
                        $response['redirectTo'] = 'index.html'; // Frontend will use this

                        // In a real application, you would start a PHP session here
                        // session_start();
                        // $_SESSION['user_id'] = $user['id'];
                        // $_SESSION['user_email'] = $user['email'];

                    } else {
                        http_response_code(401); // Unauthorized
                        $response['message'] = 'Invalid email or password.';
                    }
                } else {
                    http_response_code(401); // Unauthorized
                    $response['message'] = 'Invalid email or password.'; // Don't say "user not found" for security
                }
            } else {
                http_response_code(500);
                $response['message'] = 'Database query failed during sign-in.';
            }
        }
        unset($stmt); // Close statement
    }
}

echo json_encode($response);
unset($pdo); // Close connection
?>