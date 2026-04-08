# Board Exam Preparation - Major Restructuring

## Authentication System Overhaul (COMPLETED)
- [x] Remove Manus OAuth authentication system completely
- [x] Remove OAuth SDK and session management from server
- [x] Update useAuth hook to work without OAuth
- [x] Remove OAuth-related imports and dependencies
- [x] Update DashboardLayout to redirect unauthenticated users to contact page
- [x] Update main.tsx to redirect to contact page instead of OAuth login
- [x] Remove old useAuth hook from _core/hooks directory
- [x] Create contact collection form (ContactCollection.tsx)
- [x] Add contactSubmissions table to database schema
- [x] Create database functions for contact submissions
- [x] Add tRPC procedures for contact submission management
- [x] Add Contact Submissions tab to AdminDashboard
- [x] Create ContactSubmissionsTab component with status management
- [x] Create contact-submissions.test.ts with 5 passing tests
- [x] All 44 tests passing (39 existing + 5 new)

## Phase 1: Website Branding & Notice Section

### Branding Updates
- [ ] Update website title to "Board Exam Preparation"
- [ ] Set new logo from uploaded image
- [ ] Update app metadata and favicon
- [ ] Update navigation branding

### Notice Section
- [ ] Create notices table in database
- [ ] Add admin procedure to create/edit/delete notices
- [ ] Create Notice component for dashboard
- [ ] Display latest notices on dashboard
- [ ] Add notice management to admin panel

---

## Phase 2: Remove Fixed Subjects & Admin-Editable Content

### Remove Fixed Pages
- [ ] Remove Syllabus page
- [ ] Remove Subjects page
- [ ] Remove JEE Plan page (replace with admin-editable)
- [ ] Remove Daily Tasks page (replace with admin-editable)

### Create Admin-Editable Content System
- [ ] Create subjects table (admin can add/edit/delete)
- [ ] Create chapters table (linked to subjects)
- [ ] Create topics table (linked to chapters)
- [ ] Create admin procedures for CRUD operations
- [ ] Create admin UI for managing all content

---

## Phase 3: Enhance Admin Panel

### Group & Links Management
- [ ] Create community_groups table
- [ ] Create group_links table
- [ ] Add admin procedures to manage groups and links
- [ ] Create admin UI for editing all group links
- [ ] Display group links on dashboard

### Test Series Management
- [ ] Create test_series table
- [ ] Create test_questions table
- [ ] Add admin procedures for test series CRUD
- [ ] Create admin UI for adding/editing test series
- [ ] Link test series to subjects

---

## Phase 4: Dashboard Reorganization

### Remove Timers
- [ ] Remove Class 11 Board Exam timer
- [ ] Remove Class 12 Board Exam timer
- [ ] Remove JEE Main timer
- [ ] Remove JEE Advanced timer
- [ ] Keep only exam countdown cards (no timer)

### Add AI Chat to Dashboard
- [ ] Create AI Chat component with history
- [ ] Display chat history on dashboard
- [ ] Add message persistence to database
- [ ] Create chat history UI
- [ ] Allow users to clear history

### Show All Features
- [ ] Add Notice section to dashboard
- [ ] Add Group Links section to dashboard
- [ ] Add Test Series section to dashboard
- [ ] Add Mock Tests section to dashboard
- [ ] Add Community Posts section to dashboard
- [ ] Add Study Materials section to dashboard

---

## Phase 5: Fix Mock Tests & Test Series

### Fix Mock Tests
- [ ] Debug mock test functionality
- [ ] Ensure questions display correctly
- [ ] Add answer validation
- [ ] Add score calculation
- [ ] Add result display

### Admin Test Series Management
- [ ] Allow admins to create test series
- [ ] Allow admins to add questions to test series
- [ ] Allow admins to set time limits
- [ ] Allow admins to publish/unpublish tests
- [ ] Display test series on dashboard

---

## Phase 6: Testing & Deployment

### Testing
- [ ] Test all admin CRUD operations
- [ ] Test notice creation and display
- [ ] Test AI chat functionality
- [ ] Test mock tests
- [ ] Test test series
- [ ] Verify responsive design
- [ ] Run all vitest tests

### Deployment
- [ ] Build PWA
- [ ] Create final checkpoint
- [ ] Deploy to production
