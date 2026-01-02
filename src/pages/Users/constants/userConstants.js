
export const ADMIN_PERMISSIONS_LIST = [
    {
        category: "Users - Learners",
        permissions: [
            "Viewing access to learner's information",
            "Edit access to learner's information, change password, reset login devices",
            "Access to learner's course progress, change expiry date", // Access to edit learner's info compulsory
            "Access to enroll learners in any course"
        ]
    },
    {
        category: "Design",
        permissions: [
            "Can change website and app UI",
            "Access to edit languages and custom texts" // Change Website and App UI compulsory
        ]
    },
    {
        category: "Discussions",
        permissions: [
            "Can add, delete, reply, hide or pin posts in public forum",
            "Can add, delete, reply, hide or pin posts in all course wise discussions",
            "Can add, delete, reply, hide or pin posts in specific courses"
        ]
    },
    {
        category: "Messenger",
        permissions: ["Can access SMS and notifications"]
    },
    {
        category: "Marketing",
        permissions: [
            "Can add, edit and delete promo codes",
            "Can add, edit and delete wallet/refer & earn settings",
            "Can add, edit and delete blogs"
        ]
    },
    {
        category: "Reports",
        permissions: [
            "Can view bandwidth reports",
            "Can view usage reports",
            "Can view live tests reports",
            "Can view live class reports"
        ]
    },
    {
        category: "Users",
        permissions: [
            "Can view instructors",
            "Can view affiliates",
            "Can view enquiries"
        ]
    },
    {
        category: "Content",
        permissions: [
            "Can create, edit and delete courses",
            "Can manage live classes",
            "Can manage assignments",
            "Can manage live tests",
            "Can manage quiz reviews"
        ]
    },
    {
        category: "Memberships and chat",
        permissions: ["Can edit and manage membership and chat"]
    },
    {
        category: "Sales",
        permissions: [
            "Access to learner's initiated, success and failed transactions",
            "Can view complete sales dashboard",
            "Can view specific course sales without learner information",
            "Can view specific course sales with learner information",
            "Can export complete sales report"
        ]
    },
    {
        category: "AI Avatars",
        permissions: ["Can create, edit and manage AI Avatars"]
    }
];

export const INSTRUCTOR_PERMISSIONS_LIST = [
    "Editing of published courses",
    "Ask for approval for published courses",
    "Access of live recordings",
    "Access to sales dashboard",
    "Access to messenger",
    "Access to bandwidth reports",
    "Access to usage reports",
    "Access to live test reports",
    "Access to live class reports",
    "Access to Learner Details",
    "Access to download quiz/live tests",
    "Access to enroll learners in any course",
    "Can view enrolled learner count and access their details"
];
