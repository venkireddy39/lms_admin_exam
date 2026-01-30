$secret = 'lms_prod_jwt_secret_change_this_very_long_random_string_987654321'
$header = '{"alg":"HS512","typ":"JWT"}'
$payload = '{"sub":"admin@gmail.com","userId":1,"roleName":"ROLE_ADMIN","roles":["ROLE_ADMIN"],"permissions":["COURSE_CREATE","COURSE_UPDATE","COURSE_DELETE","COURSE_VIEW","TOPIC_CREATE","TOPIC_UPDATE","TOPIC_DELETE","TOPIC_VIEW","CONTENT_ADD","CONTENT_UPDATE","CONTENT_DELETE","CONTENT_VIEW","CONTENT_ACCESS","MANAGE_USERS","MANAGE_COURSES","VIEW_CONTENT","VIEW_PROFILE","BATCH_CREATE","BATCH_UPDATE","BATCH_DELETE","BATCH_VIEW","SESSION_CREATE","SESSION_UPDATE","SESSION_DELETE","SESSION_VIEW","SESSION_CONTENT_CREATE","SESSION_CONTENT_UPDATE","SESSION_CONTENT_DELETE","SESSION_CONTENT_VIEW","STUDENT_BATCH_CREATE","STUDENT_BATCH_UPDATE","STUDENT_BATCH_DELETE","STUDENT_BATCH_VIEW","MANAGE_PERMISSIONS","VIEW_PERMISSIONS","BOOK_CREATE","BOOK_VIEW","BOOK_UPDATE","BOOK_DELETE","BOOK_CATEGORY_CREATE","BOOK_CATEGORY_VIEW","BOOK_CATEGORY_UPDATE","BOOK_CATEGORY_DELETE","BOOK_ISSUE_RECORD_CREATE","BOOK_ISSUE_RECORD_UPDATE","BOOK_ISSUE_RECORD_VIEW","BOOK_RESERVATION_CREATE","BOOK_RESERVATION_VIEW","BOOK_RESERVATION_DELETE","LIBRARY_SETTING_CREATE","LIBRARY_SETTING_VIEW"],"authorities":["ROLE_ADMIN"],"iat":1700000000,"exp":2000000000}'

function Base64UrlEncode($bytes) { 
    [Convert]::ToBase64String($bytes).Replace('+', '-').Replace('/', '_').Replace('=', '') 
}

$headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
$payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
$encodedHeader = Base64UrlEncode $headerBytes
$encodedPayload = Base64UrlEncode $payloadBytes

$signatureInput = "$encodedHeader.$encodedPayload"
$hmac = New-Object System.Security.Cryptography.HMACSHA512
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($secret)
$signatureBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($signatureInput))
$encodedSignature = Base64UrlEncode $signatureBytes

Write-Output "TOKEN_START"
Write-Output "$encodedHeader.$encodedPayload.$encodedSignature"
Write-Output "TOKEN_END"
