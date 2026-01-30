const jwt = require('jsonwebtoken');

// Secret key (must match your backend)
const SECRET_KEY = "lms_prod_jwt_secret_change_this_very_long_random_string_987654321"; // Matches application.properties

// Token payload with library permissions
const payload = {
    sub: "admin@gmail.com",
    userId: 1,
    roles: ["ROLE_ADMIN"],
    permissions: [
        // Reduced permissions to keep token size small
        "ROLE_ADMIN",
        "MANAGE_USERS",
        "MANAGE_COURSES",
        "VIEW_CONTENT",
        "VIEW_PROFILE",
        "LIBRARY_MEMBER_VIEW",
        "LIBRARY_MEMBER_CREATE"
    ],
    authorities: ["ROLE_ADMIN"],
    iat: Math.floor(Date.now() / 1000)
};

const fs = require('fs');
const path = require('path');

// Generate token
const token = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS512' });

console.log("\n" + "=".repeat(80));
console.log("GENERATED JWT TOKEN WITH LIBRARY PERMISSIONS");
console.log("=".repeat(80));
console.log("\n" + token + "\n");
console.log("=".repeat(80));

// Save to file for auto-import
try {
    const outputPath = path.join(__dirname, 'src', 'generated_token.json');
    fs.writeFileSync(outputPath, JSON.stringify({ token }));
    console.log(`Saved token to ${outputPath}`);
} catch (err) {
    console.error("Failed to save token to file:", err);
}
