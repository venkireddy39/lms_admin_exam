import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import BookList from './pages/books/BookList';
import MemberList from './pages/members/MemberList';
import IssueList from './pages/issues/IssueList';
import IssueBook from './pages/issues/IssueBook';
import ReservationList from './pages/reservations/ReservationList';
import Settings from './pages/settings/Settings';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import CirculationRules from './pages/admin/CirculationRules';
import LibraryLayout from './components/Layout/LibraryLayout';

import { ToastProvider } from './context/ToastContext';
import { ToastProvider } from './context/ToastContext';

function LibraryApp() {
    return (
        <ToastProvider>
            <Routes>
                <Route element={<LibraryLayout />}>
                    <Route index element={<Dashboard />} />

                    <Route
                        path="books"
                        element={
                            <ProtectedRoute permission="VIEW_BOOKS">
                                <BookList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="members"
                        element={
                            <ProtectedRoute permission="VIEW_MEMBERS">
                                <MemberList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="issues"
                        element={
                            <ProtectedRoute permission="VIEW_ISSUES">
                                <IssueList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="issues/new"
                        element={
                            <ProtectedRoute permission="ISSUE_BOOKS">
                                <IssueBook />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="reservations"
                        element={
                            <ProtectedRoute permission="VIEW_ISSUES">
                                <ReservationList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="settings"
                        element={
                            <ProtectedRoute permission="SYSTEM_SETTINGS">
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="circulation-rules"
                        element={
                            <ProtectedRoute permission="SYSTEM_SETTINGS">
                                <CirculationRules />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="" replace />} />
                </Route>
            </Routes>
        </ToastProvider>
    );
}

export default LibraryApp;
