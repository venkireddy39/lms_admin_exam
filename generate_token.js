import jwt from 'jsonwebtoken';

// Secret from your environment or guess - usually HS512 requires long secret
const secret = 'lms_prod_jwt_secret_change_this_very_long_random_string_987654321';

// Detailed permissions list to ensure we cover all bases
const permissions = [
    "COURSE_CREATE", "COURSE_UPDATE", "COURSE_DELETE", "COURSE_VIEW",
    "TOPIC_CREATE", "TOPIC_UPDATE", "TOPIC_DELETE", "TOPIC_VIEW",
    "CONTENT_ADD", "CONTENT_UPDATE", "CONTENT_DELETE", "CONTENT_VIEW", "CONTENT_ACCESS",
    "MANAGE_USERS", "MANAGE_COURSES", "VIEW_CONTENT", "VIEW_PROFILE",
    "BATCH_CREATE", "BATCH_UPDATE", "BATCH_DELETE", "BATCH_VIEW",
    "SESSION_CREATE", "SESSION_UPDATE", "SESSION_DELETE", "SESSION_VIEW",
    "SESSION_CONTENT_CREATE", "SESSION_CONTENT_UPDATE", "SESSION_CONTENT_DELETE", "SESSION_CONTENT_VIEW",
    "STUDENT_BATCH_CREATE", "STUDENT_BATCH_UPDATE", "STUDENT_BATCH_DELETE", "STUDENT_BATCH_VIEW",
    "MANAGE_PERMISSIONS", "VIEW_PERMISSIONS",
    "BOOK_CREATE", "BOOK_VIEW", "BOOK_UPDATE", "BOOK_DELETE",
    "BOOK_CATEGORY_CREATE", "BOOK_CATEGORY_VIEW", "BOOK_CATEGORY_UPDATE", "BOOK_CATEGORY_DELETE",
    "BOOK_ISSUE_RECORD_CREATE", "BOOK_ISSUE_RECORD_UPDATE", "BOOK_ISSUE_RECORD_VIEW",
    "BOOK_RESERVATION_CREATE", "BOOK_RESERVATION_VIEW", "BOOK_RESERVATION_DELETE",
    "LIBRARY_SETTING_CREATE", "LIBRARY_SETTING_VIEW"
];

const authorities = [
    "ROLE_ADMIN",
    ...permissions
];

const token = jwt.sign({
    sub: 'admin@gmail.com',
    userId: 1,
    roleName: 'ROLE_ADMIN',
    roles: ['ROLE_ADMIN'], // Keep for backward compat
    permissions: permissions, // Keep for backward compat
    authorities: authorities, // NEW: Standard Spring Security claim
    iat: Math.floor(Date.now() / 1000)
}, secret, { algorithm: 'HS512', expiresIn: '365d' });

console.log(token);
