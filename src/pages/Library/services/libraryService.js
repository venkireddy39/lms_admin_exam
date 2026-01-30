import { apiFetch } from "./api";

const BASE = "/library";

export const libraryService = {
    books: {
        getAllBooks: () => apiFetch(`${BASE}/books`),
        createBook: (payload) => apiFetch(`${BASE}/books`, { method: "POST", body: JSON.stringify(payload) }),
        updateBook: (id, payload) => apiFetch(`${BASE}/books/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
        deleteBook: (id) => apiFetch(`${BASE}/books/${id}`, { method: "DELETE" }),
        generateBarcodes: (id, count) => apiFetch(`${BASE}/books/${id}/generate-barcodes?count=${count}`, { method: "POST" }),
    },
    categories: {
        getAllCategories: () => apiFetch(`${BASE}/categories`),
        createCategory: (payload) => apiFetch(`${BASE}/categories`, { method: "POST", body: JSON.stringify(payload) }),
        updateCategory: (id, payload) => apiFetch(`${BASE}/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
        deleteCategory: (id) => apiFetch(`${BASE}/categories/${id}`, { method: "DELETE" }),
    },
    issues: {
        getAllIssues: () => apiFetch(`${BASE}/issues`),
        issueBook: (bookId, userId, memberRole) =>
            apiFetch(`${BASE}/books/issue?bookId=${bookId}&userId=${userId}&memberRole=${memberRole}`, { method: "POST" }),
        issueBookWithBarcode: (bookId, userId, barcode, memberRole) =>
            apiFetch(`${BASE}/books/issue/copy?bookId=${bookId}&userId=${userId}&barcode=${encodeURIComponent(barcode)}&memberRole=${memberRole}`, { method: "POST" }),
        checkEligibility: (userId, memberRole) =>
            apiFetch(`${BASE}/members/${userId}/eligibility?memberRole=${memberRole}`),
        returnBook: (issueId) => apiFetch(`${BASE}/books/return/${issueId}`, { method: "PUT" }),
        patchIssue: (id, updates) => apiFetch(`${BASE}/issues/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
    },
    reservations: {
        getAllReservations: () => apiFetch(`${BASE}/reservations`),
        createReservation: (payload) => apiFetch(`${BASE}/reservations`, { method: "POST", body: JSON.stringify(payload) }),
        updateReservation: (id, updates) => apiFetch(`${BASE}/reservations/${id}`, { method: "PUT", body: JSON.stringify(updates) }),
        deleteReservation: (id) => apiFetch(`${BASE}/reservations/${id}`, { method: "DELETE" }),
        patchReservation: (id, updates) => apiFetch(`${BASE}/reservations/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
    },
    settings: {
        getSettings: () => apiFetch(`${BASE}/settings`),
        saveSettings: (settings) => apiFetch(`${BASE}/settings`, { method: "POST", body: JSON.stringify(settings) }),
    },
    fines: {
        getAllFines: () => apiFetch(`${BASE}/fines`),
        getFinesByUser: (userId) => apiFetch(`${BASE}/fines/user/${userId}`),
        payFine: (id) => apiFetch(`${BASE}/fines/${id}/pay`, { method: "PUT" }),
    },
    members: {
        getAllMembers: async () => {
            try {
                return await apiFetch("/admin/users");
            } catch (error) {
                console.warn("Failed to fetch members from /admin/users", error);
                return [];
            }
        },
        getMemberById: (id) => apiFetch(`/admin/users/${id}`),
    }
};
