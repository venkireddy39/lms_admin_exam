/* =========================
   LIBRARY API SERVICES
   FINAL – Backend Aligned
   ========================= */

const API_BASE_URL = "/library";

/* =========================
   AUTH HELPERS
   ========================= */

const getToken = () =>
    localStorage.getItem("authToken") || import.meta.env.VITE_DEV_AUTH_TOKEN;

const getHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
};

/* =========================
   BOOKS API
   ========================= */

export const booksAPI = {
    getAllBooks: async () => {
        const res = await fetch(`${API_BASE_URL}/books`, {
            method: "GET",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to fetch books");
        return res.json();
    },

    createBook: async (book) => {
        const payload = {
            ...book,
            category: typeof book.category === "object"
                ? book.category
                : { id: book.category }
        };

        const res = await fetch(`${API_BASE_URL}/books`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    updateBook: async (id, book) => {
        const payload = {
            ...book,
            category: typeof book.category === "object"
                ? book.category
                : { id: book.category }
        };

        const res = await fetch(`${API_BASE_URL}/books/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    deleteBook: async (id) => {
        const res = await fetch(`${API_BASE_URL}/books/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to delete book");
    }
};

/* =========================
   CATEGORIES API
   ========================= */

export const categoriesAPI = {
    getAllCategories: async () => {
        const res = await fetch(`${API_BASE_URL}/categories`, {
            method: "GET",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
    },

    createCategory: async (data) => {
        const res = await fetch(`${API_BASE_URL}/categories`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    updateCategory: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    deleteCategory: async (id) => {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to delete category");
    }
};

/* =========================
   ISSUE / RETURN API
   ========================= */

export const issuesAPI = {
    issueBook: async (bookId, userId) => {
        const res = await fetch(
            `${API_BASE_URL}/books/issue?bookId=${bookId}&userId=${userId}`,
            { method: "POST", headers: getHeaders() }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    issueBookWithBarcode: async (bookId, userId, barcode) => {
        const res = await fetch(
            `${API_BASE_URL}/books/issue/copy?bookId=${bookId}&userId=${userId}&barcode=${encodeURIComponent(barcode)}`,
            { method: "POST", headers: getHeaders() }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    checkEligibility: async (userId) => {
        const res = await fetch(`${API_BASE_URL}/members/${userId}/eligibility`, {
            method: "GET",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to check eligibility");
        return res.json();
    },

    returnBook: async (issueId) => {
        const res = await fetch(
            `${API_BASE_URL}/books/return/${issueId}`,
            { method: "PUT", headers: getHeaders() }
        );
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    getAllIssues: async () => {
        const res = await fetch(`${API_BASE_URL}/issues`, {
            method: "GET",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to fetch issues");
        return res.json();
    },

    patchIssue: async (id, updates) => {
        const res = await fetch(`${API_BASE_URL}/issues/${id}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error("Failed to patch issue");
        return res.json();
    }
};

/* =========================
   RESERVATIONS API
   ========================= */

export const reservationsAPI = {
    getAllReservations: async () => {
        const res = await fetch(`${API_BASE_URL}/reservations`, {
            method: "GET",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to fetch reservations");
        return res.json();
    },

    createReservation: async (reservation) => {
        const payload = {
            ...reservation,
            userId: reservation.memberId || reservation.userId
        };

        const res = await fetch(`${API_BASE_URL}/reservations`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    updateReservation: async (id, updates) => {
        const res = await fetch(`${API_BASE_URL}/reservations/${id}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error("Failed to update reservation");
        return res.json();
    },

    deleteReservation: async (id) => {
        const res = await fetch(`${API_BASE_URL}/reservations/${id}`, {
            method: "DELETE",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to delete reservation");
    },

    patchReservation: async (id, updates) => {
        const res = await fetch(`${API_BASE_URL}/reservations/${id}`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error("Failed to patch reservation");
        return res.json();
    }
};

/* =========================
   SETTINGS API
   ========================= */

export const settingsAPI = {
    getSettings: async () => {
        const res = await fetch(`${API_BASE_URL}/settings`, {
            method: "GET",
            headers: getHeaders()
        });
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
    },

    saveSettings: async (settings) => {
        const res = await fetch(`${API_BASE_URL}/settings`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(settings)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};

/* =========================
   UNIFIED EXPORT
   ========================= */

export const libraryService = {
    books: booksAPI,
    categories: categoriesAPI,
    issues: issuesAPI,
    reservations: reservationsAPI,
    settings: settingsAPI
};

/* =========================
   BOOK (RESOURCE) SERVICE
   ========================= */

export const BookService = {
    getAllResources: async () => {
        const books = await booksAPI.getAllBooks();

        return books.map(book => ({
            ...book,
            id: book.id,
            categoryId: book.category?.id,
            categoryName: book.category?.categoryName,
            copies: Array.from({ length: book.totalCopies || 1 }).map((_, i) => ({
                copyNo: i + 1,
                status: i < book.availableCopies ? "AVAILABLE" : "ISSUED"
            }))
        }));
    },

    createResource: async (resource) =>
        booksAPI.createBook(resource),

    updateResource: async (id, resource) =>
        booksAPI.updateBook(id, resource),

    deleteResource: async (id) =>
        booksAPI.deleteBook(id),

    getAllCategories: async () =>
        categoriesAPI.getAllCategories(),

    createCategory: async (name) =>
        categoriesAPI.createCategory(name)
};

/* =========================
   MEMBER SERVICE (ADMIN API)
   ========================= */

export const MemberService = {
    getAllMembers: async () => {
        const res = await fetch("/admin/users", {
            method: "GET",
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (!res.ok) return [];
        return res.json();
    },

    getMemberById: async (id) => {
        const res = await fetch(`/admin/users/${id}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (!res.ok) return null;
        return res.json();
    }
};

/* =========================
   ISSUE SERVICE
   ========================= */

export const IssueService = {
    issueBook: async (bookId, memberId) =>
        issuesAPI.issueBook(bookId, memberId),

    returnBook: async (issueId) =>
        issuesAPI.returnBook(issueId)
};
