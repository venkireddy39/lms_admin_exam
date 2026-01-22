/* Course Types */
export const COURSE_TYPES = {
    FREE: "FREE",
    PAID: "PAID",
};

/* Admin Course Status (soft management only) */
export const COURSE_STATUS = {
    ALL: "ALL",
    ACTIVE: "ACTIVE",
    DISABLED: "DISABLED",
};

/* Initial Form State */
export const INITIAL_FORM_DATA = {
    // Basic
    name: "",
    desc: "",
    overview: "",
    toolsCovered: "",
    img: null,
    imgPreview: null,

    // Pricing & Duration
    price: "",
    duration: "",

    // Validity
    showValidity: false,
    validityDuration: "",

    // Access
    accessPlatforms: ["Website"],
    allowOffline: false,
    contentAccessEnabled: true,

    // Certificates
    certificateEnabled: false,

    // Sharing
    shareEnabled: true,

    // Status
    status: COURSE_STATUS.ACTIVE,
};
