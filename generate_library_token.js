const jwt = require('jsonwebtoken');

// Secret key (must match your backend)
const SECRET_KEY = "lms_prod_jwt_secret_change_this_very_long_random_string_987654321"; // Matches application.properties

// Token payload with library permissions
const payload = {
    sub: "admin@gmail.com",
    userId: 1,
    roles: ["ROLE_ADMIN"],
    permissions: [
        // Book permissions (matching @PreAuthorize annotations)
        "BOOK_CREATE",
        "BOOK_UPDATE",
        "BOOK_DELETE",
        "BOOK_VIEW",
        // Book Category permissions
        "BOOK_CATEGORY_CREATE",
        "BOOK_CATEGORY_UPDATE",
        "BOOK_CATEGORY_DELETE",
        "BOOK_CATEGORY_VIEW",
        "CATEGORY_UPDATE", // For PATCH
        // Book Issue permissions
        "BOOK_ISSUE_CREATE",
        "BOOK_ISSUE_UPDATE",
        "BOOK_ISSUE_DELETE",
        "BOOK_ISSUE_VIEW",
        "ISSUE_UPDATE", // For PATCH
        // Book Reservation permissions
        "BOOK_RESERVATION_CREATE",
        "BOOK_RESERVATION_UPDATE",
        "BOOK_RESERVATION_DELETE",
        "BOOK_RESERVATION_VIEW",
        "RESERVATION_UPDATE", // For PATCH
        // Library Member permissions
        "LIBRARY_MEMBER_CREATE",
        "LIBRARY_MEMBER_UPDATE",
        "LIBRARY_MEMBER_DELETE",
        "LIBRARY_MEMBER_VIEW",
        // Library Fine permissions
        "LIBRARY_FINE_CREATE",
        "LIBRARY_FINE_UPDATE",
        "LIBRARY_FINE_DELETE",
        "LIBRARY_FINE_VIEW",
        "FINE_UPDATE", // For PATCH
        // Library Settings permissions
        "LIBRARY_SETTINGS_CREATE",
        "LIBRARY_SETTINGS_UPDATE",
        "LIBRARY_SETTINGS_DELETE",
        "LIBRARY_SETTINGS_VIEW",
        // General permissions
        "MANAGE_USERS",
        "MANAGE_COURSES",
        "VIEW_CONTENT",
        "VIEW_PROFILE"
    ],
    authorities: ["ROLE_ADMIN"],
    iat: Math.floor(Date.now() / 1000)
};

// Generate token
const token = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });

console.log("\n=".repeat(80));
console.log("GENERATED JWT TOKEN WITH LIBRARY PERMISSIONS");
console.log("=".repeat(80));
console.log("\n" + token + "\n");
console.log("=".repeat(80));
console.log("\nCopy this token and:");
console.log("1. Update .env.local: VITE_DEV_AUTH_TOKEN=<token>");
console.log("2. Or set in localStorage: localStorage.setItem('authToken', '<token>')");
console.log("=".repeat(80) + "\n");
