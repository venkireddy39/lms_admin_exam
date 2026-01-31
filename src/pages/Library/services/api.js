import { apiFetch } from "../../../services/api";
import { libraryService } from "./libraryService";

export { apiFetch };

/* =========================
   RESOURCE (BOOK) SERVICE
   ========================= */

// Helper to map backend book data to frontend resource format
const mapBookToResource = (book) => {
    const total = book.totalCopies || 1;
    const available = book.availableCopies ?? total;

    // Use real barcodes from backend if they exist
    let copies = [];
    if (book.barcodes && book.barcodes.length > 0) {
        copies = book.barcodes.map(bc => ({
            uuid: bc.barcodeId,
            barcode: bc.barcodeValue,
            status: bc.isIssued ? 'ISSUED' : 'AVAILABLE',
            condition: 'Good'
        }));
    } else {
        // Fallback to virtual barcodes if none generated yet
        copies = Array.from({ length: total }).map((_, i) => ({
            uuid: `${book.id || book.bookId}-${i + 1}`,
            barcode: book.isbn ? `${book.isbn}-${i + 1}` : `CPY-${book.bookId}-${i + 1}`,
            status: i < available ? 'AVAILABLE' : 'ISSUED',
            condition: 'Good'
        }));
    }

    // Ensure category is always an object
    const categoryObj = (typeof book.category === 'object' && book.category)
        ? book.category
        : { id: null, categoryName: book.category || 'General' };

    return {
        ...book,
        id: book.id || book.bookId,
        category: categoryObj,
        copies: copies
    };
};

export const BookService = {
    getAllResources: async () => {
        const rawBooks = await libraryService.books.getAllBooks();
        const books = Array.isArray(rawBooks) ? rawBooks : (rawBooks.content || []);
        return books.map(mapBookToResource);
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
        const payload = {
            ...resource,
            category: typeof resource.category === 'object' ? resource.category : { id: resource.category }
        };
        const created = await libraryService.books.createBook(payload);
        return mapBookToResource(created);
    },

    updateResource: async (id, updates) => {
        const payload = { ...updates };
        if (updates.category !== undefined) {
            payload.category = typeof updates.category === 'object' ? updates.category : { id: updates.category };
        }

        const updated = await libraryService.books.updateBook(id, payload);
        return mapBookToResource(updated);
    },

    deleteResource: async (id) => {
        return libraryService.books.deleteBook(id);
    },

    getAllCategories: async () => {
        return libraryService.categories.getAllCategories();
    },

    createCategory: async (categoryName) => {
        return libraryService.categories.createCategory({ categoryName });
    }
};

/* =========================
   MEMBER SERVICE
   ========================= */

export const MemberService = {
    getAllMembers: async () => {
        try {
            // Fetch Users and Issues in parallel to calculate active loans
            const [users, issues] = await Promise.all([
                libraryService.members.getAllMembers(),
                libraryService.issues.getAllIssues().catch(err => {
                    console.warn("Failed to fetch issues for member stats", err);
                    return [];
                })
            ]);

            // Check if data is valid, but ALLOW empty array (meaning 0 users found, which is valid)
            if (!users || !Array.isArray(users)) throw new Error("Invalid users data");

            // Calculate active issues per user
            const issueCounts = {};
            const issueList = Array.isArray(issues) ? issues : (issues.content || []);

            issueList.forEach(i => {
                // Check for active status
                if (['ISSUED', 'OVERDUE', 'RENEWED'].includes(i.status)) {
                    // Try to resolve userId from various possible fields
                    const uid = i.userId || i.member?.id || i.memberId;
                    if (uid) {
                        issueCounts[uid] = (issueCounts[uid] || 0) + 1;
                    }
                }
            });

            return users.map(u => ({
                id: u.userId || u.id,
                memberId: (u.userId || u.id).toString(),
                name: u.firstName ? `${u.firstName} ${u.lastName}` : (u.name || 'Unknown'),
                email: u.email,
                mobile: u.phone || u.mobile,
                role: u.roleName ? u.roleName.replace('ROLE_', '') : 'USER',
                category: (u.roleName === 'ROLE_STUDENT' || u.roleName === 'pool') ? 'Student' : 'Faculty',
                status: u.enabled ? 'ACTIVE' : 'BLOCKED',
                maxBooks: (u.roleName === 'ROLE_FACULTY') ? 10 : 3, // Basic default, ideally from settings
                issuedBooks: issueCounts[u.userId || u.id] || 0
            }));
        } catch (error) {
            console.error("Failed to fetch members", error);
            return [];
        }
    },

    getMemberById: async (id) => {
        const u = await libraryService.members.getMemberById(id);
        return {
            id: u.userId || u.id,
            memberId: (u.userId || u.id).toString(),
            name: u.firstName ? `${u.firstName} ${u.lastName}` : (u.name || 'Unknown'),
            email: u.email,
            mobile: u.phone || u.mobile,
            role: u.roleName ? u.roleName.replace('ROLE_', '') : 'USER',
            category: (u.roleName === 'ROLE_STUDENT' || u.roleName === 'pool') ? 'Student' : 'Faculty',
            status: u.enabled ? 'ACTIVE' : 'BLOCKED'
        };
    }
};

/* =========================
   ISSUE / RETURN SERVICE
   ========================= */

export const IssueService = {
    getAllIssues: async () => {
        const res = await libraryService.issues.getAllIssues();
        return Array.isArray(res) ? res : (res.content || []);
    },

    validateEligibility: async (userId) => {
        const user = await MemberService.getMemberById(userId);
        const memberRole = user.category ? user.category.toUpperCase() : 'STUDENT';
        const isEligible = await libraryService.issues.checkEligibility(userId, memberRole);
        if (!isEligible) {
            throw new Error('Member has reached maximum book limit or has outstanding issues');
        }
        return { eligible: true, user };
    },

    createIssue: async (issue) => {
        return libraryService.issues.issueBook(issue.bookId, issue.userId);
    },

    issueCopy: async ({ userId, bookId, copyId, resourceId, barcode }) => {
        const user = await MemberService.getMemberById(userId);
        const memberRole = user.category ? user.category.toUpperCase() : 'STUDENT';

        // Prioritize explicit barcode, then barcode-like copyId
        // If copyId is a complex UUID-like string (e.g. "1-1"), it might be a virtual ID, 
        // but if it's a real barcode, we use it. 
        // Ideally, frontend should pass 'barcode' explicitely.
        const bc = barcode || (copyId && !copyId.includes('-') ? copyId : null);

        // Debug log to ensure we are sending what we think we are sending
        console.log("Issuer Service - Issue Copy:", { userId, bookId, copyId, barcode, finalBarcode: bc });

        if (bc) {
            return libraryService.issues.issueBookWithBarcode(bookId || resourceId, userId, bc, memberRole);
        }

        // If we have a copyId that LOOKS like a generated ID (e.g. 1-1),
        // we might still want to try to find the real barcode?
        // But for now, fallback to generic issue if no clean barcode found.
        return libraryService.issues.issueBook(bookId || resourceId, userId, memberRole);
    },

    updateIssue: async (id, updates) => {
        return libraryService.issues.patchIssue(id, updates);
    },

    renewIssue: async (id) => {
        const issues = await libraryService.issues.getAllIssues();
        const issue = issues.find(i => i.id === id);
        if (!issue) throw new Error('Issue not found');

        const currentDue = new Date(issue.dueDate);
        const newDue = new Date(currentDue.setDate(currentDue.getDate() + 14));

        return libraryService.issues.patchIssue(id, {
            dueDate: newDue.toISOString()
        });
    },

    getReturnPreview: async (issueId) => {
        // Fetch Issue, Settings, and Member details needed for calculation
        const [issues, settings] = await Promise.all([
            libraryService.issues.getAllIssues(),
            SettingsService.getSettings()
        ]);

        const issue = issues.find(i => i.id === issueId);
        if (!issue) throw new Error('Issue not found');

        const now = new Date();
        const due = new Date(issue.dueDate);
        const diffTime = now - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const overdueDays = diffDays > 0 ? diffDays : 0;

        // Calculate Fine based on Slabs
        let fineAmount = 0;
        if (overdueDays > 0) {
            // Determine Role
            // issue might have memberRole or we check member object
            const role = (issue.memberRole || (issue.member && issue.member.roleName) || 'student').toLowerCase().includes('faculty') ? 'faculty' : 'student';
            const rule = settings.rules[role] || settings.rules['student'];
            const slabs = rule ? (rule.fineSlabs || []) : [];

            // Calculate per day incrementally
            if (slabs.length > 0) {
                for (let day = 1; day <= overdueDays; day++) {
                    // Find slab where current 'day' falls between fromDay and toDay
                    // If toDay is null/0, assume infinity
                    const slab = slabs.find(s => day >= s.from && (day <= s.to || !s.to));
                    const dailyFine = slab ? slab.amount : 0; // If no slab defined for this day, 0 (or fallback)
                    fineAmount += dailyFine;
                }
            } else {
                // Fallback if no slabs configured
                fineAmount = overdueDays * 5;
            }
        }

        return {
            issue,
            overdueDays,
            fineAmount,
            returnDate: now.toISOString()
        };
    },

    returnIssue: async (id, { waiveFine } = {}) => {
        const returned = await libraryService.issues.returnBook(id);
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
        return libraryService.reservations.patchReservation(id, { status: 'COLLECTED' });
    },

    patchReservation: async (id, updates) => {
        return libraryService.reservations.patchReservation(id, updates);
    },

    rejectReservation: async (id) => {
        return libraryService.reservations.patchReservation(id, { status: 'CANCELLED' });
    }
};

/* =========================
   DASHBOARD SERVICE
   ========================= */

export const DashboardService = {
    getSummary: async () => {
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
                (i) => i.status === "ISSUED" && i.dueDate && new Date(i.dueDate) < now
            ).length,
            digitalAccess: books.filter((b) => b.type === "DIGITAL").length,
            activeMembers: members.filter((m) => m.status === "ACTIVE" || m.enabled).length,
            totalMembers: members.length
        };
    },

    getTrends: async () => {
        const issues = await libraryService.issues.getAllIssues();
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            return {
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                issues: issues.filter(issue => issue.issueDate && issue.issueDate.startsWith(dateStr)).length
            };
        });
        return last7Days;
    },

    getRecentActivity: async () => {
        try {
            const [issues, members] = await Promise.all([
                libraryService.issues.getAllIssues(),
                MemberService.getAllMembers()
            ]);

            // Create Member Lookup Map
            const memberMap = {};
            if (Array.isArray(members)) {
                members.forEach(m => {
                    if (m.id) {
                        memberMap[m.id] = m.name;
                        memberMap[m.id.toString()] = m.name;
                        // Also Map memberId if it differs
                        if (m.memberId) memberMap[m.memberId] = m.name;
                    }
                });
            }

            if (!Array.isArray(issues)) return [];

            return issues
                .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
                .slice(0, 10)
                .map(issue => {
                    const memberId = issue.userId || issue.memberId || (issue.member ? (issue.member.id || issue.member.userId) : null);

                    let userName = 'Unknown';
                    if (memberId && memberMap[memberId]) {
                        userName = memberMap[memberId];
                    } else if (issue.memberName) {
                        userName = issue.memberName;
                    } else if (issue.member && issue.member.fullName) {
                        userName = issue.member.fullName;
                    }

                    return {
                        id: issue.issueId || issue.id,
                        type: (issue.status === 'RETURNED' || issue.status === 'RETURNED_LATE') ? 'return' : 'issue',
                        user: userName,
                        resource: issue.book?.title || issue.bookTitle || issue.book?.bookTitle || 'Unknown',
                        date: issue.issueDate,
                        status: issue.status
                    };
                });
        } catch (error) {
            console.error(error);
            return [];
        }
    }
};

/* =========================
   SETTINGS SERVICE
   ========================= */

export const SettingsService = {
    getSettings: async () => {
        const settingsList = await libraryService.settings.getSettings();
        const rules = {
            student: { maxBooks: 3, issueDays: 14 },
            faculty: { maxBooks: 10, issueDays: 90 }
        };

        if (Array.isArray(settingsList)) {
            settingsList.forEach(s => {
                const role = s.memberRole ? s.memberRole.toLowerCase() : null;
                if (role === 'student' || role === 'faculty') {
                    // Check if we already found a rule for this role
                    const existing = rules[role];
                    const hasSlabs = s.fineSlabs && s.fineSlabs.length > 0;

                    // If no existing rule, OR if current row has slabs (prioritize data availability), OR existing has no slabs
                    if (!existing.id || hasSlabs) {
                        rules[role] = {
                            id: s.settingId || s.id,
                            maxBooks: s.maxBooks,
                            issueDays: s.issueDurationDays || s.issueDays,
                            reservationDays: s.reservationDurationDays || 2,
                            fineSlabs: hasSlabs ? s.fineSlabs.map(fs => ({
                                id: fs.id || Math.random(), // Ensure ID exists
                                from: fs.fromDay,
                                to: fs.toDay,
                                amount: fs.finePerDay
                            })) : []
                        };
                    }
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
    },

    updateSettings: async (settings) => {
        return libraryService.settings.saveSettings(settings);
    }
};
