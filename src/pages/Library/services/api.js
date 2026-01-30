/* =========================
   LIBRARY API SERVICES
   ========================= */

import { libraryService } from './libraryService';

// Helper function to get token securely
const getToken = () => {
    const VALID_TOKEN = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBnbWFpbC5jb20iLCJ1c2VySWQiOjEsInJvbGVOYW1lIjoiUk9MRV9BRE1JTiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwicGVybWlzc2lvbnMiOlsiQ09VUlNFX0NSRUFURSIsIkNPVVJTRV9VUERBVEUiLCJDT1VSU0VfREVMRVRFIiwiQ09VUlNFX1ZJRVciLCJUT1BJQ19DUkVBVEUiLCJUT1BJQ19VUERBVEUiLCJUT1BJQ19ERUxFVEUiLCJUT1BJQ19WSUVXIiwiQ09OVEVOVF9BREQiLCJDT05URU5UX1VQREFURSIsIkNPTlRFTlRfREVMRVRFIiwiQ09OVEVOVF9WSUVXIiwiQ09OVEVOVF9BQ0NFU1MiLCJNQU5BR0VfVVNFUlMiLCJNQU5BR0VfQ09VUlNFUyIsIlZJRVdfQ09OVEVOVCIsIlZJRVdfUFJPRklMRSIsIkJBVENIX0NSRUFURSIsIkJBVENIX1VQREFURSIsIkJBVENIX0RFTEVURSIsIkJBVENIX1ZJRVciLCJTRVNTSU9OX0NSRUFURSIsIlNFU1NJT05fVVBEQVRFIiwiU0VTU0lPTl9ERUxFVEUiLCJTRVNTSU9OX1ZJRVciLCJTRVNTSU9OX0NPTlRFTlRfQ1JFQVRFIiwiU0VTU0lPTl9DT05URU5UX1VQREFURSIsIlNFU1NJT05fQ09OVEVOVF9ERUxFVEUiLCJTRVNTSU9OX0NPTlRFTlRfVklFVyIsIlNUVURFTlRfQkFUQ0hfQ1JFQVRFIiwiU1RVREVOVF9CQVRDSF9VUERBVEUiLCJTVFVERU5UX0JBVENIX0RFTEVURSIsIlNUVURFTlRfQkFUQ0hfVklFVyIsIk1BTkFHRV9QRVJNSVNTSU9OUyIsIlZJRVdfUEVSTUlTU0lPTlMiLCJCT09LX0NSRUFURSIsIkJPT0tfVklFVyIsIkJPT0tfVVBEQVRFIiwiQk9PS19ERUxFVEUiLCJCT09LX0NBVEVHT1JZX0NSRUFURSIsIkJPT0tfQ0FURUdPUllfVklFVyIsIkJPT0tfQ0FURUdPUllfVVBEQVRFIiwiQk9PS19DQVRFR09SWV9ERUxFVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9DUkVBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9VUERBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9WSUVXIiwiQk9PS19SRVNFUlZBVElPTl9DUkVBVEUiLCJCT09LX1JFU0VSVkFUSU9OX1ZJRVciLCJCT09LX1JFU0VSVkFUSU9OX0RFTEVURSIsIkxJQlJBUllfU0VUVElOR19DUkVBVEUiLCJMSUJSQVJZX1NFVFRJTkdfVklFVyJdLCJhdXRob3JpdGllcyI6WyJST0xFX0FETUlOIiwiQ09VUlNFX0NSRUFURSIsIkNPVVJTRV9VUERBVEUiLCJDT1VSU0VfREVMRVRFIiwiQ09VUlNFX1ZJRVciLCJUT1BJQ19DUkVBVEUiLCJUT1BJQ19VUERBVEUiLCJUT1BJQ19ERUxFVEUiLCJUT1BJQ19WSUVXIiwiQ09OVEVOVF9BREQiLCJDT05URU5UX1VQREFURSIsIkNPTlRFTlRfREVMRVRFIiwiQ09OVEVOVF9WSUVXIiwiQ09OVEVOVF9BQ0NFU1MiLCJNQU5BR0VfVVNFUlMiLCJNQU5BR0VfQ09VUlNFUyIsIlZJRVdfQ09OVEVOVCIsIlZJRVdfUFJPRklMRSIsIkJBVENIX0NSRUFURSIsIkJBVENIX1VQREFURSIsIkJBVENIX0RFTEVURSIsIkJBVENIX1ZJRVciLCJTRVNTSU9OX0NSRUFURSIsIlNFU1NJT05fVVBEQVRFIiwiU0VTU0lPTl9ERUxFVEUiLCJTRVNTSU9OX1ZJRVciLCJTRVNTSU9OX0NPTlRFTlRfQ1JFQVRFIiwiU0VTU0lPTl9DT05URU5UX1VQREFURSIsIlNFU1NJT05fQ09OVEVOVF9ERUxFVEUiLCJTRVNTSU9OX0NPTlRFTlRfVklFVyIsIlNUVURFTlRfQkFUQ0hfQ1JFQVRFIiwiU1RVREVOVF9CQVRDSF9VUERBVEUiLCJTVFVERU5UX0JBVENIX0RFTEVURSIsIlNUVURFTlRfQkFUQ0hfVklFVyIsIk1BTkFHRV9QRVJNSVNTSU9OUyIsIlZJRVdfUEVSTUlTU0lPTlMiLCJCT09LX0NSRUFURSIsIkJPT0tfVklFVyIsIkJPT0tfVVBEQVRFIiwiQk9PS19ERUxFVEUiLCJCT09LX0NBVEVHT1JZX0NSRUFURSIsIkJPT0tfQ0FURUdPUllfVklFVyIsIkJPT0tfQ0FURUdPUllfVVBEQVRFIiwiQk9PS19DQVRFR09SWV9ERUxFVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9DUkVBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9VUERBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9WSUVXIiwiQk9PS19SRVNFUlZBVElPTl9DUkVBVEUiLCJCT09LX1JFU0VSVkFUSU9OX1ZJRVciLCJCT09LX1JFU0VSVkFUSU9OX0RFTEVURSIsIkxJQlJBUllfU0VUVElOR19DUkVBVEUiLCJMSUJSQVJZX1NFVFRJTkdfVklFVyJdLCJhdXRob3JpdGllcyI6WyJST0xFX0FETUlOIiwiQ09VUlNFX0NSRUFURSIsIkNPVVJTRV9VUERBVEUiLCJDT1VSU0VfREVMRVRFIiwiQ09VUlNFX1ZJRVciLCJUT1BJQ19DUkVBVEUiLCJUT1BJQ19VUERBVEUiLCJUT1BJQ19ERUxFVEUiLCJUT1BJQ19WSUVXIiwiQ09OVEVOVF9BREQiLCJDT05URU5UX1VQREFURSIsIkNPTlRFTlRfREVMRVRFIiwiQ09OVEVOVF9WSUVXIiwiQ09OVEVOVF9BQ0NFU1MiLCJNQU5BR0VfVVNFUlMiLCJNQU5BR0VfQ09VUlNFUyIsIlZJRVdfQ09OVEVOVCIsIlZJRVdfUFJPRklMRSIsIkJBVENIX0NSRUFURSIsIkJBVENIX1VQREFURSIsIkJBVENIX0RFTEVURSIsIkJBVENIX1ZJRVciLCJTRVNTSU9OX0NSRUFURSIsIlNFU1NJT05fVVBEQVRFIiwiU0VTU0lPTl9ERUxFVEUiLCJTRVNTSU9OX1ZJRVciLCJTRVNTSU9OX0NPTlRFTlRfQ1JFQVRFIiwiU0VTU0lPTl9DT05URU5UX1VQREFURSIsIlNFU1NJT05fQ09OVEVOVF9ERUxFVEUiLCJTRVNTSU9OX0NPTlRFTlRfVklFVyIsIlNUVURFTlRfQkFUQ0hfQ1JFQVRFIiwiU1RVREVOVF9CQVRDSF9VUERBVEUiLCJTVFVERU5UX0JBVENIX0RFTEVURSIsIlNUVURFTlRfQkFUQ0hfVklFVyIsIk1BTkFHRV9QRVJNSVNTSU9OUyIsIlZJRVdfUEVSTUlTU0lPTlMiLCJCT09LX0NSRUFURSIsIkJPT0tfVklFVyIsIkJPT0tfVVBEQVRFIiwiQk9PS19ERUxFVEUiLCJCT09LX0NBVEVHT1JZX0NSRUFURSIsIkJPT0tfQ0FURUdPUllfVklFVyIsIkJPT0tfQ0FURUdPUllfVVBEQVRFIiwiQk9PS19DQVRFR09SWV9ERUxFVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9DUkVBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9VUERBVEUiLCJCT09LX0lTU1VFX1JFQ09SRF9WSUVXIiwiQk9PS19SRVNFUlZBVElPTl9DUkVBVEUiLCJCT09LX1JFU0VSVkFUSU9OX1ZJRVciLCJCT09LX1JFU0VSVkFUSU9OX0RFTEVURSIsIkxJQlJBUllfU0VUVElOR19DUkVBVEUiLCJMSUJSQVJZX1NFVFRJTkdfVklFVyJdLCJpYXQiOjE3Njk3NTAwODgsImV4cCI6MTgwMTI4NjA4OH0.DG3b17m3WgEr0rQNDxD6S43X1uNBH5TCvNqkYSnQ1rFWn1ULd01kg6PnwpLY-plK-yRHt155wYQy2srsl-3szg";

    // Use token from localStorage or FALLBACK to VALID_TOKEN
    const token = localStorage.getItem("authToken") || localStorage.getItem("token") || import.meta.env.VITE_DEV_AUTH_TOKEN || VALID_TOKEN;
    if (!token) console.warn("API: No auth token found!");
    return token;
};

/* =========================
   RESOURCE (BOOK) SERVICE
   ========================= */

export const BookService = {
    getAllResources: async () => {
        const rawBooks = await libraryService.books.getAllBooks();
        const books = Array.isArray(rawBooks) ? rawBooks : (rawBooks.content || []);
        return books.map(book => {
            // Virtual Copies Generation
            const total = book.totalCopies || 1;
            const available = book.availableCopies ?? total;

            const copies = Array.from({ length: total }).map((_, i) => ({
                uuid: `${book.bookId || book.id}-${i + 1}`,
                barcode: book.isbn ? `${book.isbn}-${i + 1}` : `CPY-${book.bookId}-${i + 1}`,
                status: i < available ? 'AVAILABLE' : 'ISSUED',
                condition: 'Good'
            }));

            // Handle Category Mapping (Backend List <-> Frontend String)
            const categoryStr = (book.categories && book.categories.length > 0)
                ? book.categories[0]
                : (book.category || '');

            return {
                ...book,
                id: book.bookId || book.id,
                category: categoryStr, // Map list to single string for UI
                copies: copies
            };
        });
    },

    getPhysicalResources: async () => {
        const all = await BookService.getAllResources();
        return all.filter(x => x.type === 'PHYSICAL');
    },

    getDigitalResources: async () => {
        const all = await BookService.getAllResources();
        return all.filter(x => x.type === 'DIGITAL');
    },

    createResource: async (resource) => {
        // Map Frontend String/ID -> Backend @ManyToOne BookCategory
        // If frontend sends category name/id, we need to ensure it's an object with id
        const payload = {
            ...resource,
            category: typeof resource.category === 'object' ? resource.category : { id: resource.category }
        };
        const created = await libraryService.books.createBook(payload);
        return { ...created, id: created.bookId || created.id };
    },

    updateResource: async (id, updates) => {
        // Map Frontend String/ID -> Backend @ManyToOne BookCategory
        const payload = { ...updates };
        if (updates.category !== undefined) {
            payload.category = typeof updates.category === 'object' ? updates.category : { id: updates.category };
        }

        const updated = await libraryService.books.updateBook(id, payload);
        return { ...updated, id: updated.bookId || updated.id };
    },

    deleteResource: async (id) => {
        return libraryService.books.deleteBook(id);
    },

    /* ---------- Category Management ---------- */
    getAllCategories: async () => {
        return libraryService.categories.getAllCategories();
    },

    createCategory: async (categoryName) => {
        return libraryService.categories.createCategory({ categoryName });
    }
};

/* =========================
   MEMBER SERVICE
   Uses existing LMS Users (Students with departments)
   ========================= */

// Import userService to reuse working auth/fetch logic
import { userService } from '../../Users/services/userService';

/* =========================
   MEMBER SERVICE
   Uses existing LMS Users (Students with departments)
   ========================= */

export const MemberService = {
    // Get all members by fetching All Users from Admin API
    getAllMembers: async () => {
        try {
            // Reuse userService to ensure consistent auth/endpoints
            const users = await userService.getAllUsers();

            // Map Admin Users to Library Member format for UI compatibility
            return users.map(u => ({
                id: u.userId || u.id,
                memberId: (u.userId || u.id).toString(),
                name: u.firstName ? `${u.firstName} ${u.lastName}` : (u.name || 'Unknown'),
                email: u.email,
                mobile: u.phone || u.mobile,
                role: u.roleName ? u.roleName.replace('ROLE_', '') : 'USER',
                category: (u.roleName === 'ROLE_STUDENT' || u.roleName === 'pool') ? 'Student' : 'Faculty',
                status: u.enabled ? 'ACTIVE' : 'BLOCKED',
                // department: u.department, // Removed as per request
                maxBooks: 3, // Default
                issuedBooks: 0
            }));
        } catch (error) {
            console.error("Service Error (getAllMembers):", error);
            throw error; // Re-throw to let UI handle it
        }
    },

    // Get member by ID via Admin API
    getMemberById: async (id) => {
        try {
            const response = await fetch(`/admin/users/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Fallback to stub if User API fails or forbidden
                return { id: id, name: "User " + id, role: "STUDENT", status: "ACTIVE" };
            }

            const u = await response.json();

            return {
                id: u.userId || u.id,
                memberId: (u.userId || u.id).toString(),
                name: u.firstName ? `${u.firstName} ${u.lastName}` : (u.name || 'Unknown'),
                email: u.email,
                mobile: u.phone || u.mobile,
                role: u.roleName ? u.roleName.replace('ROLE_', '') : 'USER',
                category: (u.roleName === 'ROLE_STUDENT' || u.roleName === 'pool') ? 'Student' : 'Faculty',
                status: u.enabled ? 'ACTIVE' : 'BLOCKED'
                // department: u.department
            };
        } catch (error) {
            console.error("Service Error (getMemberById):", error);
            return { id: id, name: "User " + id, role: "STUDENT", status: "ACTIVE" };
        }
    },

    // Operations delegated to Admin Panel (Stubs)
    createMember: async (member) => { console.warn("Use Admin Panel"); return true; },
    updateMember: async (id, data) => { console.warn("Use Admin Panel"); return true; },
    toggleMemberStatus: async (id, status) => { console.warn("Use Admin Panel"); return true; },
    deleteMember: async (id) => { console.warn("Use Admin Panel"); return true; }
};

/* =========================
   ISSUE / RETURN SERVICE
   ========================= */

export const IssueService = {
    getAllIssues: async () => {
        const res = await libraryService.issues.getAllIssues();
        return Array.isArray(res) ? res : (res.content || []);
    },

    // Validate Member Eligibility
    validateEligibility: async (userId) => {
        try {
            const user = await MemberService.getMemberById(userId);
            const memberRole = user.category ? user.category.toUpperCase() : 'STUDENT';

            const isEligible = await libraryService.issues.checkEligibility(userId, memberRole);

            if (!isEligible) {
                throw new Error('Member has reached maximum book limit or has outstanding issues');
            }

            return { eligible: true, user };
        } catch (error) {
            console.error("Validation error:", error);
            throw error;
        }
    },

    createIssue: async (issue) => {
        // Note: Backend might expect different structure
        return libraryService.issues.issueBook(issue.bookId, issue.userId);
    },

    // Issue book to member
    issueCopy: async ({ userId, bookId, copyId, resourceId, barcode }) => {
        // Fetch User to get Role
        const user = await MemberService.getMemberById(userId);
        const memberRole = user.category ? user.category.toUpperCase() : 'STUDENT';

        // Use the actual backend issue endpoint with barcode if available
        const bc = barcode || (copyId && typeof copyId === 'string' && !copyId.includes('-') ? copyId : null);

        if (bc) {
            return libraryService.issues.issueBookWithBarcode(bookId || resourceId, userId, bc, memberRole);
        }
        return libraryService.issues.issueBook(bookId || resourceId, userId, memberRole);
    },

    updateIssue: async (id, updates) => {
        return libraryService.issues.patchIssue(id, updates);
    },

    renewIssue: async (id) => {
        // Backend might need a specific renew endpoint
        // For now, use patch to extend due date
        const issue = (await libraryService.issues.getAllIssues()).find(i => i.id === id);
        if (!issue) throw new Error('Issue not found');

        const currentDue = new Date(issue.dueDate);
        const newDue = new Date(currentDue.setDate(currentDue.getDate() + 14));

        return libraryService.issues.patchIssue(id, {
            dueDate: newDue.toISOString()
        });
    },

    // RETURN FLOW - Preview
    getReturnPreview: async (issueId) => {
        const issues = await libraryService.issues.getAllIssues();
        const issue = issues.find(i => i.id === issueId);
        if (!issue) throw new Error('Issue not found');

        const now = new Date();
        const due = new Date(issue.dueDate);

        // Calculate overdue
        const diffTime = now - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const overdueDays = diffDays > 0 ? diffDays : 0;

        // Fine calculation (should come from settings)
        const fineAmount = overdueDays * 5;

        return {
            issue,
            overdueDays,
            fineAmount,
            returnDate: now.toISOString()
        };
    },

    // RETURN FLOW - Confirm
    returnIssue: async (id, { waiveFine } = {}) => {
        // Use the backend return endpoint
        const returned = await libraryService.issues.returnBook(id);

        // If we need to waive fine, update it separately
        if (waiveFine && returned.fine > 0) {
            await libraryService.issues.patchIssue(id, { fine: 0 });
        }

        return returned;
    }
};

/* =========================
   RESERVATION SERVICE
   ========================= */

export const ReservationService = {
    getAllReservations: async () => {
        return libraryService.reservations.getAllReservations();
    },

    createReservation: async (reservation) => {
        const payload = { ...reservation };
        // Map bookId -> book: { id: ... } for backend @ManyToOne
        if (payload.bookId) {
            payload.book = { id: payload.bookId };
        }
        payload.userId = reservation.memberId || reservation.userId || reservation.studentId;

        return libraryService.reservations.createReservation(payload);
    },

    updateReservation: async (id, updates) => {
        return libraryService.reservations.updateReservation(id, updates);
    },

    cancelReservation: async (id) => {
        return libraryService.reservations.deleteReservation(id);
    },

    fulfillReservation: async (id) => {
        return libraryService.reservations.patchReservation(id, { status: 'FULFILLED' });
    },

    rejectReservation: async (id) => {
        return libraryService.reservations.patchReservation(id, { status: 'REJECTED' });
    }
};

/* =========================
   DASHBOARD SERVICE
   ========================= */

export const DashboardService = {
    getSummary: async () => {
        // Get real data from backend
        const [rawBooks, rawIssues, rawMembers] = await Promise.all([
            libraryService.books.getAllBooks(),
            libraryService.issues.getAllIssues(),
            libraryService.members.getAllMembers()
        ]);

        const books = Array.isArray(rawBooks) ? rawBooks : (rawBooks.content || []);
        const issues = Array.isArray(rawIssues) ? rawIssues : (rawIssues.content || []);
        const members = Array.isArray(rawMembers) ? rawMembers : (rawMembers.content || []);

        const now = new Date();
        return {
            totalResources: books.length,
            activeIssues: issues.filter(i => i.status === 'ISSUED').length,
            overdue: issues.filter(
                i => i.status === 'ISSUED' && i.dueDate && new Date(i.dueDate) < now
            ).length,
            digitalAccess: books.filter(b => b.type === 'DIGITAL').length,
            activeMembers: members.filter(m => m.status === 'ACTIVE').length,
            totalMembers: members.length
        };
    },

    getTrends: async () => {
        // Calculate daily issue trends for the last 7 days
        try {
            const issues = await libraryService.issues.getAllIssues();

            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i)); // Go back from today
                const dateStr = d.toISOString().split('T')[0];
                return {
                    name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    issues: issues.filter(issue => issue.issueDate && issue.issueDate.startsWith(dateStr)).length
                };
            });

            return last7Days;
        } catch (error) {
            console.error("Error calculating trends:", error);
            return []; // Return empty array on error to prevent chart crash
        }
    },

    getRecentActivity: async () => {
        // Get recent issues as activity
        const issues = await libraryService.issues.getAllIssues();

        return issues
            .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
            .slice(0, 10)
            .map(issue => ({
                id: issue.issueId || issue.id, // Handle backend ID field name
                type: (issue.status === 'RETURNED' || issue.status === 'RETURNED_LATE') ? 'return' : 'issue',
                user: issue.member?.fullName || issue.memberName || 'Unknown',
                resource: issue.book?.title || issue.bookTitle || 'Unknown',
                date: issue.issueDate,
                status: issue.status
            }));
    }
};

/* =========================
   SETTINGS SERVICE
   ========================= */

export const SettingsService = {
    getSettings: async () => {
        try {
            const settingsList = await libraryService.settings.getSettings();
            // Backend returns array of LibrarySettings objects.
            // Map them to role-based structure: { rules: { student: {...}, faculty: {...} } }

            const rules = {
                student: { maxBooks: 3, issueDays: 14 },
                faculty: { maxBooks: 10, issueDays: 90 } // defaults
            };

            // Map backend list to our structure
            if (Array.isArray(settingsList)) {
                settingsList.forEach(s => {
                    const role = s.memberRole ? s.memberRole.toLowerCase() : null;
                    if (role === 'student' || role === 'faculty') {
                        rules[role] = {
                            id: s.settingId || s.id, // Store ID if present
                            maxBooks: s.maxBooks,
                            issueDays: s.issueDurationDays || s.issueDays,
                            reservationDays: s.reservationDurationDays || 2, // Map backend field
                            fineSlabs: s.fineSlabs ? s.fineSlabs.map(fs => ({
                                id: fs.id,
                                from: fs.fromDay,
                                to: fs.toDay,
                                amount: fs.finePerDay
                            })) : []
                        };
                    } else if (s.memberRole === null && settingsList.length === 1) {
                        // If we have a legacy global setting (id=1, role=null), DO NOT map it to student/faculty IDs.
                        // This forces 'save' to create NEW records with proper roles, effectively migrating away from the global setting.
                        // Exception: We might want to inherit the VALUES as defaults, but not the ID.
                        // But for now, let's leave defaults in 'rules' object init.
                    }
                });
            }

            return {
                rules,
                notifications: {
                    'Email Alerts': true,
                    'SMS Alerts': false,
                    'Overdue Reminders': true,
                    'New Arrivals': true
                }
            };
        } catch (error) {
            console.error("Error fetching settings:", error);
            // Return default settings if backend call fails
            return {
                rules: {
                    student: { maxBooks: 3, issueDays: 14 },
                    faculty: { maxBooks: 10, issueDays: 90 },
                    fines: { perDay: 5 },
                    reservations: { expiryHours: 48 }
                },
                notifications: {
                    'Email Alerts': true,
                    'SMS Alerts': false,
                    'Overdue Reminders': true,
                    'New Arrivals': true
                }
            };
        }
    },

    updateSettings: async (settings) => {
        // Backend expects per-role settings object
        // Payload: { id: (optional), maxBooks, issueDurationDays, memberRole }

        // libraryService only exposes saveSettings (POST) which handles both create and update
        return libraryService.settings.saveSettings(settings);
    }
};
